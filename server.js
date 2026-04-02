const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── AI 实时查询 ──
app.post('/api/search', async (req, res) => {
  const { query, category, country } = req.body;
  if (!query) return res.json({ results: [] });
  if (!QWEN_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const categoryLabel = category === 'work' ? '工作签证/移民项目' : '大学院校（本科/研究生）';
  const countryLabel = country && country !== 'all' ? `目标国家：${country}` : '不限国家';

  const prompt = `你是一个专业的PTE Academic（Pearson Test of English Academic，考场版，非Online版）分数要求查询助手。

用户查询：「${query}」
查询类型：${categoryLabel}
${countryLabel}

请你通过搜索最新官方信息，查找该院校或移民项目对 PTE Academic 的分数要求。

重要规则：
1. 只查 PTE Academic（考场版），不包括 PTE Academic Online
2. 如果该院校/项目明确不接受PTE Academic，请标注"不接受"
3. 分数因专业/层次不同可能有差异，请列出主要类别
4. 数据来源必须是官方网站
5. 如果找不到明确信息，请如实标注"无官方信息"

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "schoolName": "院校/项目英文名",
  "schoolNameZh": "院校/项目中文名",
  "country": "国家（uk/au/nz/ca/sg/hk/cn/eu/other）",
  "flag": "国旗emoji",
  "sourceUrl": "官方语言要求页面URL",
  "programs": [
    {
      "level": "层次（如：本科/研究生/MBA/移民签证等）",
      "name": "具体项目或专业类别",
      "accept": true或false或null（null表示无信息）,
      "overall": 总分数字或null,
      "overallNote": "分数说明（如有范围或特殊说明）",
      "reading": 阅读分数或null,
      "writing": 写作分数或null,
      "listening": 听力分数或null,
      "speaking": 口语分数或null,
      "componentNote": "单项说明（如有）",
      "updated": "数据来源时间或版本"
    }
  ],
  "generalNote": "整体备注（如：分数因专业而异，建议以官网为准）"
}`;

  try {
    const response = await fetch(QWEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          type: 'web_search',
          web_search: { search_query: `${query} PTE Academic score requirements official` }
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Qwen API error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    // 提取文本内容
    const content = data.choices?.[0]?.message?.content || '';
    console.log('AI raw response:', content);

    // 解析 JSON
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      return res.json({ results: [], rawContent: content, parseError: true });
    }

    // 标准化数据结构
    const result = {
      id: Date.now(),
      name: parsed.schoolName || query,
      nameZh: parsed.schoolNameZh || query,
      country: parsed.country || 'other',
      flag: parsed.flag || '🌐',
      sourceUrl: parsed.sourceUrl || '',
      generalNote: parsed.generalNote || '',
      programs: (parsed.programs || []).map(p => ({
        level: p.level || '—',
        name: p.name || '所有项目',
        accept: p.accept,
        overall: p.overall,
        overallNote: p.overallNote || '',
        reading: p.reading,
        writing: p.writing,
        listening: p.listening,
        speaking: p.speaking,
        componentNote: p.componentNote || '',
        updated: p.updated || '2025'
      }))
    };

    res.json({ results: [result], source: 'ai' });

  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── AI 聊天（悬浮机器人）──
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!QWEN_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `你是一个PTE Academic分数查询小助手。专门帮用户了解PTE Academic（考场版）在各国大学和移民项目中的分数要求。
请用简洁友好的中文回答，100字以内。如果用户问具体院校的分数，建议他们使用搜索框查询获得最准确的实时数据。`;

  try {
    const r = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${QWEN_API_KEY}` },
      body: JSON.stringify({
        model: 'qwen-turbo',
        max_tokens: 300,
        messages: [{ role: 'system', content: systemPrompt }, ...messages]
      })
    });
    const d = await r.json();
    const reply = d.choices?.[0]?.message?.content || '抱歉，暂时无法回答，请稍后再试。';
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PTE Finder v2 running on port ${PORT}`));
