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

const DB = {
  study: [
    { id:1, name:'University of Sheffield', nameZh:'谢菲尔德大学', country:'uk', flag:'🇬🇧', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:51, reading:51, writing:51, listening:51, speaking:51, updated:'2024-09', src:'https://www.sheffield.ac.uk/international/language-requirements' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:59, reading:59, writing:59, listening:59, speaking:59, updated:'2024-09', src:'https://www.sheffield.ac.uk/international/language-requirements' },
    ]},
    { id:2, name:'University of Manchester', nameZh:'曼彻斯特大学', country:'uk', flag:'🇬🇧', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:59, reading:59, writing:59, listening:59, speaking:59, updated:'2024-10', src:'https://www.manchester.ac.uk/study/international/applying/entry-requirements/english-language/' },
      { level:'研究生', name:'MBA', accept:true, overall:65, reading:62, writing:62, listening:62, speaking:62, updated:'2024-10', src:'https://www.manchester.ac.uk/study/masters/courses/list/00971/mba/' },
    ]},
    { id:3, name:'University of Melbourne', nameZh:'墨尔本大学', country:'au', flag:'🇦🇺', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:57, reading:50, writing:50, listening:50, speaking:50, updated:'2024-11', src:'https://study.unimelb.edu.au/how-to-apply/english-language-requirements' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:65, reading:58, writing:58, listening:58, speaking:58, updated:'2024-11', src:'https://study.unimelb.edu.au/how-to-apply/english-language-requirements' },
    ]},
    { id:4, name:'University of Sydney', nameZh:'悉尼大学', country:'au', flag:'🇦🇺', programs:[
      { level:'本科', name:'商科', accept:true, overall:61, reading:54, writing:54, listening:54, speaking:54, updated:'2024-08', src:'https://www.sydney.edu.au/study/how-to-apply/undergraduate/english-language-requirements.html' },
      { level:'研究生', name:'法律', accept:false, overall:null, updated:'2024-08', src:'https://www.sydney.edu.au/law' },
    ]},
    { id:5, name:'University of Auckland', nameZh:'奥克兰大学', country:'nz', flag:'🇳🇿', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:50, reading:null, writing:null, listening:null, speaking:null, updated:'2024-07', src:'https://www.auckland.ac.nz/en/study/applications-and-admissions/how-to-apply/supporting-documents/english-language-requirements.html' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:58, reading:null, writing:null, listening:null, speaking:null, updated:'2024-07', src:'https://www.auckland.ac.nz/en/study/applications-and-admissions/how-to-apply/supporting-documents/english-language-requirements.html' },
    ]},
    { id:6, name:'University of Toronto', nameZh:'多伦多大学', country:'ca', flag:'🇨🇦', programs:[
      { level:'本科', name:'所有本科项目', accept:null, overall:null, updated:'2024-09', src:'https://future.utoronto.ca/apply/requirements/english-language-proficiency/' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:60, reading:60, writing:60, listening:60, speaking:60, updated:'2024-09', src:'https://sgs.utoronto.ca/policies-guidelines/english-language-proficiency-requirement/' },
    ]},
    { id:7, name:'Imperial College London', nameZh:'帝国理工学院', country:'uk', flag:'🇬🇧', programs:[
      { level:'研究生', name:'理工科项目', accept:true, overall:59, reading:59, writing:59, listening:59, speaking:59, updated:'2024-10', src:'https://www.imperial.ac.uk/study/apply/postgraduate-taught/entry-requirements/english-language/' },
    ]},
    { id:8, name:'University of British Columbia', nameZh:'不列颠哥伦比亚大学', country:'ca', flag:'🇨🇦', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:60, reading:60, writing:60, listening:60, speaking:60, updated:'2024-08', src:'https://you.ubc.ca/applying-ubc/requirements/english-language-requirement/' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:65, reading:60, writing:60, listening:60, speaking:60, updated:'2024-08', src:'https://you.ubc.ca/applying-ubc/requirements/english-language-requirement/' },
    ]},
    { id:9, name:'University College London', nameZh:'伦敦大学学院', country:'uk', flag:'🇬🇧', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:51, reading:51, writing:51, listening:51, speaking:51, updated:'2024-09', src:'https://www.ucl.ac.uk/prospective-students/undergraduate/application/entry-requirements/english-language-requirements' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:59, reading:59, writing:59, listening:59, speaking:59, updated:'2024-09', src:'https://www.ucl.ac.uk/prospective-students/graduate/applying/english-language' },
    ]},
    { id:10, name:'Monash University', nameZh:'莫纳什大学', country:'au', flag:'🇦🇺', programs:[
      { level:'本科', name:'所有本科项目', accept:true, overall:50, reading:50, writing:50, listening:50, speaking:50, updated:'2024-10', src:'https://www.monash.edu/admissions/entry-requirements/english-language-requirements' },
      { level:'研究生', name:'所有研究生项目', accept:true, overall:58, reading:50, writing:50, listening:50, speaking:50, updated:'2024-10', src:'https://www.monash.edu/admissions/entry-requirements/english-language-requirements' },
    ]},
  ],
  work: [
    { id:101, name:'Australia Skilled Independent Visa (189)', nameZh:'澳大利亚技术移民 189', country:'au', flag:'🇦🇺', programs:[
      { level:'移民签证', name:'189 / 190 技术移民', accept:true, overall:65, reading:65, writing:65, listening:65, speaking:65, updated:'2024-11', src:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189' },
    ]},
    { id:102, name:'UK Skilled Worker Visa', nameZh:'英国技术工作签证', country:'uk', flag:'🇬🇧', programs:[
      { level:'工作签证', name:'技术工作者', accept:null, overall:null, updated:'2024-09', src:'https://www.gov.uk/skilled-worker-visa/knowledge-of-english' },
    ]},
    { id:103, name:'Canada Express Entry', nameZh:'加拿大快速通道移民', country:'ca', flag:'🇨🇦', programs:[
      { level:'移民项目', name:'联邦技术工人', accept:true, overall:65, reading:65, writing:65, listening:65, speaking:65, updated:'2024-10', src:'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements.html' },
    ]},
    { id:104, name:'New Zealand Skilled Migrant Category', nameZh:'新西兰技术移民', country:'nz', flag:'🇳🇿', programs:[
      { level:'移民项目', name:'技术移民类别', accept:true, overall:50, reading:null, writing:null, listening:null, speaking:null, updated:'2024-08', src:'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/tools-and-information/english-language' },
    ]},
  ]
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/data', (req, res) => res.json(DB));

app.post('/api/search', (req, res) => {
  const { query, category, country } = req.body;
  if (!query) return res.json({ results: [] });
  const data = DB[category] || DB.study;
  const pool = country && country !== 'all' ? data.filter(s => s.country === country) : data;
  const q = query.toLowerCase().trim();
  const results = pool.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.nameZh.includes(q) ||
    s.name.toLowerCase().replace('university of ', '').startsWith(q) ||
    s.nameZh.replace('大学', '').includes(q) ||
    s.nameZh.replace('学院', '').includes(q)
  );
  res.json({ results });
});

app.post('/api/ai-search', async (req, res) => {
  const { query, category, country } = req.body;
  if (!QWEN_API_KEY) return res.status(500).json({ error: 'API key not configured' });
  const data = DB[category] || DB.study;
  const pool = country && country !== 'all' ? data.filter(s => s.country === country) : data;
  const nameList = pool.map(s => `${s.nameZh}(${s.name})`).join('、');
  const prompt = `用户搜索词："${query}"。数据库中的院校有：${nameList}。请返回最匹配的院校的中文名，只返回名字本身，不加任何解释。如果没有匹配返回"无"。`;
  try {
    const r = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${QWEN_API_KEY}` },
      body: JSON.stringify({ model: 'qwen-turbo', max_tokens: 60, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    const ans = d.choices?.[0]?.message?.content?.trim();
    if (!ans || ans === '无') return res.json({ results: [] });
    const results = pool.filter(s => s.nameZh.includes(ans) || ans.includes(s.nameZh));
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!QWEN_API_KEY) return res.status(500).json({ error: 'API key not configured' });
  const systemPrompt = `你是 PTE 分数查询工具的 AI 小助手，专门帮助用户了解 PTE 考试分数要求。
数据库覆盖英国、澳大利亚、新西兰、加拿大的主流院校和移民项目。
以下是数据库摘要：
- 英国院校：谢菲尔德(本51/研59)、曼彻斯特(本59/MBA65)、帝国理工(研59)、伦敦大学学院(本51/研59)
- 澳大利亚院校：墨尔本(本57/研65)、悉尼(商科61)、莫纳什(本50/研58)
- 新西兰：奥克兰大学(本50/研58)
- 加拿大：多伦多(研60)、UBC(本60/研65)
- 移民：澳洲189(65分)、加拿大快速通道(65分)、新西兰技术移民(50分)
请用简洁友好的中文回答，控制在100字以内。如果问题超出范围，请引导用户使用搜索框查询具体院校。`;
  try {
    const r = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${QWEN_API_KEY}` },
      body: JSON.stringify({
        model: 'qwen-turbo',
        max_tokens: 200,
        messages: [{ role: 'system', content: systemPrompt }, ...messages]
      })
    });
    const d = await r.json();
    const reply = d.choices?.[0]?.message?.content || '抱歉，我暂时无法回答，请稍后再试。';
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PTE Finder running on port ${PORT}`));
