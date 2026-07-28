import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware for parsing large JSON payloads (base64 chart images up to 100mb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // In-Memory Backoffice / Admin Data Store
  const adminUsers = [
    {
      id: 'usr_101',
      name: 'สมชาย สายเทรด (Somchai)',
      email: 'somchai.trader@gmail.com',
      plan: 'PRO_MONTHLY',
      dailyAnalysisCount: 14,
      dailyQuotaLimit: 9999,
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      isLoggedIn: true,
    },
    {
      id: 'usr_102',
      name: 'วิภาดา Forex Pro',
      email: 'wipada.fx@yahoo.com',
      plan: 'PRO_ANNUAL',
      dailyAnalysisCount: 42,
      dailyQuotaLimit: 9999,
      joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isLoggedIn: true,
    },
    {
      id: 'usr_103',
      name: 'กิตติศักดิ์ ทองคำ (Kittisak)',
      email: 'kittisak.gold@hotmail.com',
      plan: 'FREE',
      dailyAnalysisCount: 3,
      dailyQuotaLimit: 9999,
      joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      isLoggedIn: true,
    },
    {
      id: 'usr_104',
      name: 'Crypto Master TH',
      email: 'cryptomaster@outlook.com',
      plan: 'FREE',
      dailyAnalysisCount: 1,
      dailyQuotaLimit: 9999,
      joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      isLoggedIn: true,
    },
  ];

  const paymentTransactions = [
    {
      id: 'tx_5501',
      userId: 'usr_101',
      userName: 'สมชาย สายเทรด (Somchai)',
      userEmail: 'somchai.trader@gmail.com',
      plan: 'PRO_MONTHLY',
      amountThb: 590,
      method: 'PROMPTPAY',
      status: 'APPROVED',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      referenceCode: 'PP-20260710-8821',
    },
    {
      id: 'tx_5502',
      userId: 'usr_102',
      userName: 'วิภาดา Forex Pro',
      userEmail: 'wipada.fx@yahoo.com',
      plan: 'PRO_ANNUAL',
      amountThb: 4900,
      method: 'CREDIT_CARD',
      status: 'APPROVED',
      timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      referenceCode: 'CC-20260614-9912',
    },
    {
      id: 'tx_5503',
      userId: 'usr_103',
      userName: 'กิตติศักดิ์ ทองคำ (Kittisak)',
      userEmail: 'kittisak.gold@hotmail.com',
      plan: 'PRO_MONTHLY',
      amountThb: 590,
      method: 'PROMPTPAY',
      status: 'PENDING',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      referenceCode: 'PP-20260724-1049',
    },
  ];

  const analysisLogs: any[] = [
    {
      id: 'log_001',
      userId: 'usr_101',
      userName: 'สมชาย สายเทรด (Somchai)',
      symbol: 'XAU/USD (Gold)',
      strategy: 'SMC',
      signal: 'BUY',
      confidenceScore: 88,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_002',
      userId: 'usr_102',
      userName: 'วิภาดา Forex Pro',
      symbol: 'EUR/USD',
      strategy: 'ICT',
      signal: 'SELL',
      confidenceScore: 92,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_003',
      userId: 'usr_103',
      userName: 'กิตติศักดิ์ ทองคำ (Kittisak)',
      symbol: 'XAU/USD (Gold)',
      strategy: 'PRICE_ACTION',
      signal: 'BUY',
      confidenceScore: 81,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Registered User DB in Memory
  const registeredUsersDB: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    joinedAt: string;
    plan: string;
  }> = [
    {
      id: 'usr_101',
      name: 'สมชาย สายเทรด (Somchai)',
      email: 'somchai.trader@gmail.com',
      passwordHash: '123456',
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'PRO_MONTHLY',
    },
    {
      id: 'usr_102',
      name: 'วิภาดา Forex Pro',
      email: 'wipada.fx@yahoo.com',
      passwordHash: '123456',
      joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'PRO_ANNUAL',
    },
    {
      id: 'usr_103',
      name: 'กิตติศักดิ์ ทองคำ (Kittisak)',
      email: 'kittisak.gold@hotmail.com',
      passwordHash: '123456',
      joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'FREE',
    },
    {
      id: 'usr_104',
      name: 'Crypto Master TH',
      email: 'cryptomaster@outlook.com',
      passwordHash: '123456',
      joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'FREE',
    },
    {
      id: 'usr_demo',
      name: 'Trader Pro',
      email: 'demo.trader@example.com',
      passwordHash: '123456',
      joinedAt: new Date().toISOString(),
      plan: 'FREE',
    }
  ];

  // Auth: Register Endpoint
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = (name || cleanEmail.split('@')[0] || 'Trader').toString().trim();

      if (String(password).length < 4) {
        return res.status(400).json({ error: 'กรุณาตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร' });
      }

      const existing = registeredUsersDB.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาสลับไปที่เมนูเข้าสู่ระบบ' });
      }

      // Check if pre-granted VIP in adminUsers
      const preGranted = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      const assignedPlan = preGranted?.plan || 'FREE';

      const newUser = {
        id: preGranted?.id || 'usr_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        passwordHash: String(password),
        joinedAt: new Date().toISOString(),
        plan: assignedPlan,
      };

      registeredUsersDB.push(newUser);

      if (preGranted) {
        preGranted.name = cleanName;
        preGranted.isLoggedIn = true;
        preGranted.lastActive = new Date().toISOString();
      } else {
        adminUsers.unshift({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          plan: assignedPlan,
          dailyAnalysisCount: 0,
          dailyQuotaLimit: 9999,
          joinedAt: newUser.joinedAt,
          lastActive: new Date().toISOString(),
          isLoggedIn: true,
        });
      }

      return res.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          plan: assignedPlan,
          isLoggedIn: true,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/register:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ระหว่างลงทะเบียน: ' + (err.message || 'Server error') });
    }
  });

  // Auth: Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const passStr = String(password);
      const foundUser = registeredUsersDB.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        // Demo trader fallback
        if (cleanEmail === 'demo.trader@example.com' && (passStr === 'demo1234' || passStr === '123456')) {
          const demoUser = {
            id: 'usr_demo',
            name: 'Trader Pro',
            email: cleanEmail,
            plan: 'PRO_MONTHLY',
            isLoggedIn: true,
          };
          return res.json({ success: true, user: demoUser });
        }

        return res.status(400).json({ error: 'ไม่พบบัญชีผู้ใช้สำหรับอีเมลนี้ กรุณาสมัครสมาชิกใหม่ก่อนเข้าใช้งาน' });
      }

      if (foundUser.passwordHash !== passStr) {
        return res.status(400).json({ error: 'รหัสผ่านไม่ถูกต้อง! กรุณาตรวจสอบและลองใหม่อีกครั้ง' });
      }

      // Get latest status from adminUsers
      const nowIso = new Date().toISOString();
      const adminIdx = adminUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      let userPlan = foundUser.plan || 'FREE';

      if (adminIdx >= 0) {
        adminUsers[adminIdx].lastActive = nowIso;
        adminUsers[adminIdx].isLoggedIn = true;
        userPlan = adminUsers[adminIdx].plan || userPlan;
      } else {
        adminUsers.unshift({
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          plan: userPlan,
          dailyAnalysisCount: 0,
          dailyQuotaLimit: 9999,
          joinedAt: foundUser.joinedAt || nowIso,
          lastActive: nowIso,
          isLoggedIn: true,
        });
      }

      return res.json({
        success: true,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          plan: userPlan,
          isLoggedIn: true,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/login:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ระหว่างเข้าสู่ระบบ: ' + (err.message || 'Server error') });
    }
  });

  // Auth: Check Current User Info / Status Endpoint
  app.get('/api/auth/me', (req, res) => {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Missing email parameter' });
    }

    const adminU = adminUsers.find((u) => u.email.toLowerCase() === email);
    const dbU = registeredUsersDB.find((u) => u.email.toLowerCase() === email);

    if (adminU || dbU) {
      const plan = adminU?.plan || dbU?.plan || 'FREE';
      const name = adminU?.name || dbU?.name || email.split('@')[0];
      const id = adminU?.id || dbU?.id || 'usr_' + Date.now();
      return res.json({
        success: true,
        user: {
          id,
          name,
          email,
          plan,
          isLoggedIn: true,
        },
      });
    }

    res.status(404).json({ error: 'User not found' });
  });

  // User Sync & Activity API
  app.post('/api/user/sync', (req, res) => {
    const { user, transaction } = req.body;
    if (user && user.email) {
      const existingIdx = adminUsers.findIndex((u) => u.email === user.email || u.id === user.id);
      if (existingIdx >= 0) {
        adminUsers[existingIdx] = {
          ...adminUsers[existingIdx],
          ...user,
          lastActive: new Date().toISOString(),
        };
      } else {
        adminUsers.push({
          id: user.id || 'usr_' + Date.now(),
          name: user.name || 'ผู้ใช้ใหม่',
          email: user.email,
          plan: user.plan || 'FREE',
          dailyAnalysisCount: user.dailyAnalysisCount || 0,
          dailyQuotaLimit: user.dailyQuotaLimit || 10,
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isLoggedIn: true,
        });
      }
    }

    if (transaction) {
      paymentTransactions.unshift({
        id: 'tx_' + Date.now(),
        userId: user?.id || 'usr_guest',
        userName: user?.name || 'ลูกค้าทั่วไป',
        userEmail: user?.email || 'guest@example.com',
        plan: transaction.plan || 'PRO_MONTHLY',
        amountThb: transaction.amountThb || 590,
        method: transaction.method || 'PROMPTPAY',
        status: transaction.status || 'APPROVED',
        timestamp: new Date().toISOString(),
        referenceCode: 'PP-' + Date.now().toString().slice(-8),
      });
    }

    res.json({ success: true, message: 'User & transaction synced successfully' });
  });

  // ADMIN BACKOFFICE ENDPOINTS
  // 1. Get Admin Overview Statistics
  app.get('/api/admin/stats', (req, res) => {
    const totalUsers = adminUsers.length;
    const totalVipUsers = adminUsers.filter((u) => u.plan !== 'FREE').length;
    const totalRevenueThb = paymentTransactions
      .filter((t) => t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amountThb, 0);
    const totalAnalysesCount = analysisLogs.length;
    const todayAnalysesCount = analysisLogs.filter(
      (l) => new Date(l.timestamp).toDateString() === new Date().toDateString()
    ).length;
    const pendingPaymentsCount = paymentTransactions.filter((t) => t.status === 'PENDING').length;

    res.json({
      totalUsers,
      totalVipUsers,
      totalRevenueThb,
      totalAnalysesCount,
      todayAnalysesCount,
      pendingPaymentsCount,
    });
  });

  // 2. Get Users List
  app.get('/api/admin/users', (req, res) => {
    res.json(adminUsers);
  });

  // 3. Update User Plan (Admin Override by ID, Email, or Name)
  app.post('/api/admin/users/update-plan', (req, res) => {
    const { userId, email, name, plan, targetQuery } = req.body;
    const query = (targetQuery || email || name || userId || '').toString().trim().toLowerCase();

    // 1. Search by ID, Email, or Name
    let u = adminUsers.find(
      (user) =>
        (userId && user.id === userId) ||
        (query && user.id.toLowerCase() === query) ||
        (query && user.email.toLowerCase() === query) ||
        (query && user.name.toLowerCase() === query)
    );

    // 2. Partial search if not found
    if (!u && query) {
      u = adminUsers.find(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.name.toLowerCase().includes(query)
      );
    }

    if (u) {
      u.plan = plan;
      u.dailyQuotaLimit = plan === 'FREE' ? 10 : 9999;
      const dbUser = registeredUsersDB.find((ru) => ru.id === u.id || ru.email.toLowerCase() === u.email.toLowerCase());
      if (dbUser) dbUser.plan = plan;
      return res.json({
        success: true,
        user: u,
        message: `ปรับสถานะผู้ใช้ "${u.name}" (${u.email}) เป็น ${plan === 'FREE' ? 'FREE (ยกเลิก VIP)' : 'Pro VIP (เปิดใช้งานแล้ว)'} เรียบร้อยแล้ว`,
      });
    }

    // 3. If not found and admin wants to grant VIP, create user directly!
    if (query && plan !== 'FREE') {
      const isEmailFormat = query.includes('@');
      const cleanEmail = isEmailFormat ? query : `${query.replace(/\s+/g, '')}@user.com`;
      const userName = isEmailFormat ? query.split('@')[0] : (name || targetQuery || 'VIP Member');
      const newId = 'usr_' + Date.now();
      const nowIso = new Date().toISOString();

      const newUser = {
        id: newId,
        name: userName,
        email: cleanEmail,
        plan: plan || 'PRO_MONTHLY',
        dailyAnalysisCount: 0,
        dailyQuotaLimit: 9999,
        joinedAt: nowIso,
        lastActive: nowIso,
        isLoggedIn: false,
      };

      adminUsers.unshift(newUser);
      registeredUsersDB.push({
        id: newId,
        name: userName,
        email: cleanEmail,
        passwordHash: '123456',
        joinedAt: nowIso,
        plan: newUser.plan,
      });

      return res.json({
        success: true,
        user: newUser,
        message: `เพิ่มสมาชิกใหม่และเปิดใช้งาน Pro VIP ให้กับ "${userName}" (${cleanEmail}) เรียบร้อยแล้ว`,
      });
    }

    res.status(404).json({ error: 'ไม่พบผู้สมัครจากชื่อหรืออีเมลที่ระบุ' });
  });

  // 3b. Create User (Admin Action)
  app.post('/api/admin/users/create', (req, res) => {
    const { name, email, password, plan = 'FREE' } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อและอีเมลผู้ใช้งาน' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
    }

    const newId = 'usr_' + Date.now();
    const nowIso = new Date().toISOString();

    const newUser = {
      id: newId,
      name,
      email: cleanEmail,
      plan,
      dailyAnalysisCount: 0,
      dailyQuotaLimit: plan === 'FREE' ? 10 : 9999,
      joinedAt: nowIso,
      lastActive: nowIso,
      isLoggedIn: false,
    };

    adminUsers.unshift(newUser);
    registeredUsersDB.push({
      id: newId,
      name,
      email: cleanEmail,
      passwordHash: password || '123456',
      joinedAt: nowIso,
      plan,
    });

    res.json({ success: true, user: newUser });
  });

  // 3c. Delete User (Admin Action)
  app.post('/api/admin/users/delete', (req, res) => {
    const { userId } = req.body;
    const idx = adminUsers.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      const removed = adminUsers.splice(idx, 1)[0];
      const dbIdx = registeredUsersDB.findIndex((ru) => ru.id === userId || ru.email === removed.email);
      if (dbIdx >= 0) registeredUsersDB.splice(dbIdx, 1);
      return res.json({ success: true, message: 'ลบสมาชิกเรียบร้อยแล้ว' });
    }
    res.status(404).json({ error: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
  });

  // 4. Get Payment Transactions List
  app.get('/api/admin/payments', (req, res) => {
    res.json(paymentTransactions);
  });

  // 4b. Create Manual Payment (Admin Action)
  app.post('/api/admin/payments/create', (req, res) => {
    const { userId, userEmail, userName, plan = 'PRO_MONTHLY', amountThb = 590, method = 'PROMPTPAY' } = req.body;

    const nowIso = new Date().toISOString();
    const newTx = {
      id: 'tx_' + Date.now(),
      userId: userId || 'usr_manual',
      userName: userName || 'ลูกค้าชำระตรง',
      userEmail: userEmail || 'manual@example.com',
      plan,
      amountThb: Number(amountThb) || 590,
      method,
      status: 'APPROVED',
      timestamp: nowIso,
      referenceCode: 'ADMIN-' + Date.now().toString().slice(-8),
    };

    paymentTransactions.unshift(newTx);

    // Update user plan if user exists
    const u = adminUsers.find((user) => user.id === userId || user.email === userEmail);
    if (u) {
      u.plan = plan;
      u.dailyQuotaLimit = 9999;
    }

    res.json({ success: true, transaction: newTx });
  });

  // 5. Approve / Reject Payment
  app.post('/api/admin/payments/approve', (req, res) => {
    const { transactionId, action } = req.body; // action = 'APPROVE' | 'REJECT'
    const tx = paymentTransactions.find((t) => t.id === transactionId);
    if (tx) {
      tx.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      if (action === 'APPROVE') {
        const u = adminUsers.find((user) => user.id === tx.userId || user.email === tx.userEmail);
        if (u) {
          u.plan = tx.plan;
          u.dailyQuotaLimit = 9999;
        }
      }
      return res.json({ success: true, transaction: tx });
    }
    res.status(404).json({ error: 'Transaction not found' });
  });

  // 6. Get AI Analysis Logs
  app.get('/api/admin/analyses', (req, res) => {
    res.json(analysisLogs);
  });

  // Helper to get Gemini client using user's personal API Key or system fallback
  const getAi = (userApiKey?: string) => {
    const apiKey = (userApiKey && userApiKey.trim()) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('กรุณาระบุ Google Gemini API Key ในระบบก่อนเริ่มใช้งาน');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Multi-Timeframe Chart Analysis Endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { h4Image, h1Image, m30Image, m15Image, m5Image, m1Image, strategy = 'SMC', customNotes = '', customApiKey, analysisMode = 'STANDARD' } = req.body || {};

      const effectiveKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
      if (!effectiveKey) {
        return res.status(400).json({
          error: 'กรุณาระบุ Google Gemini API Key ส่วนตัวของคุณในช่องตั้งค่าก่อนวิเคราะห์กราฟ'
        });
      }

      if (!h4Image && !h1Image && !m30Image && !m15Image && !m5Image && !m1Image) {
        return res.status(400).json({ error: 'กรุณาอัปโหลดรูปภาพกราฟอย่างน้อย 1 Timeframe' });
      }

      const isScalpMode = analysisMode === 'SCALPING';

      // Strategy specific system prompts & instructions in Thai
      const strategyGuide: Record<string, string> = {
        SMC: `เน้นวิเคราะห์ Smart Money Concepts (SMC):
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: หา Higher Timeframe Bias, Major Market Structure (HH/HL/LH/LL), Major Order Block (OB), Liquidity Pool (BSL/SSL).
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: หา Inducement, Fair Value Gap (FVG), Change of Character (ChoCH), Break of Structure (BoS), Liquidity Sweep และจุดพักตัวย่อเด้ง.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: หา จุดเข้าเทรด Sniper Trigger M1 (Micro OB / FVG tap, M1 ChoCH + BoS, Wick Rejection Spike) พร้อมคำนวณ Entry, SL ที่แคบมาก (โดนลากน้อย) และ TP1, TP2, TP3 (กำไรเยอะ R:R สูง).`,
        
        PRICE_ACTION: `เน้นวิเคราะห์ Classic Price Action & Chart Patterns:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: แนวรับแนวต้านสำคัญ (Key Support & Resistance), Major Trendlines, Dominant Trend ภาพกว้าง.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: รูปแบบกราฟ (Chart Patterns เช่น Head & Shoulders, Double Top/Bottom, Triangles, Channel), Candlestick Pattern (Pinbar, Engulfing).
- ${isScalpMode ? 'TF M1' : 'TF M15'}: จุดเข้า Breakout & Retest หรือ Bounce จาก Key Level หา Entry M1, SL และ TP.`,

        ICT: `เน้นวิเคราะห์ Inner Circle Trader (ICT Methodology):
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Daily/H4 Bias, Liquidity Voids, Key Benchmark Levels.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Power of 3 (AMD: Accumulation, Manipulation, Distribution), Judas Swing, Kill Zone setup, Fair Value Gap (FVG).
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Optimal Trade Entry (OTE - 61.8% to 79% Fibonacci retracement), Silver Bullet setup, Displacement Confirmation, Entry M1, SL, TP.`,

        SUPPLY_DEMAND: `เน้นวิเคราะห์ Supply & Demand Imbalance:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Fresh Supply & Demand Zones, Rally-Base-Drop (RBD), Drop-Base-Rally (DBR), Rally-Base-Rally (RBR), Drop-Base-Drop (DBD).
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Zone Quality Score (Freshness, Strength of Departure, Time at Base), Zone Flips.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Confirmation Touch / Drop into Zone M1, Entry at Zone Margin M1, SL outside zone Buffer, TP at Next Opposing Zone.`,

        BREAKOUT_TREND: `เน้นวิเคราะห์ Trend Following & Breakout Strategy:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Directional Momentum, Moving Averages / Higher Highs.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Compression / Consolidation Box, Key Resistance/Support Trigger line.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: High Volume Breakout Confirmation M1, Pullback Retest M1, Entry, SL, TP1, TP2, TP3.`,

        HARMONIC: `เน้นวิเคราะห์ Harmonic & Fibonacci Patterns:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Macro Trend & Fibonacci Retracement / Extension levels.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Potential Reversal Zone (PRZ), Harmonic Patterns (Gartley, Bat, Butterfly, Crab, ABCD).
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Reversal Candle Confirmation at PRZ M1, Entry M1, SL (Beyond X), TP1 (38.2% Fib), TP2 (61.8% Fib).`
      };

      const parts: any[] = [];

      // Process TF H4 image if available
      if (h4Image) {
        const matches = h4Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe H4 (Macro Structure & Trend ใหญ่ภาพกว้าง):'
          });
        }
      }

      // Process TF H1 image if available
      if (h1Image) {
        const matches = h1Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe H1 (Primary Trend & Major Level):'
          });
        }
      }

      // Process TF M30 image if available
      if (m30Image) {
        const matches = m30Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe M30 (Key Supply / Demand Zone คุมราคา):'
          });
        }
      }

      // Process TF M15 image if available
      if (m15Image) {
        const matches = m15Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe M15 (Intermediate Pullback & Setup Zone):'
          });
        }
      }

      // Process TF M5 image if available
      if (m5Image) {
        const matches = m5Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe M5 (Micro Structure Trigger Zone):'
          });
        }
      }

      // Process TF M1 image if available
      if (m1Image) {
        const matches = m1Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
          parts.push({
            text: 'ภาพกราฟ Timeframe M1 (Precision Sniper Trigger M1 - จุดเข้าเทรดสไนเปอร์ คมกริบ โดนลากน้อย):'
          });
        }
      }

      const modeHeaderPrompt = isScalpMode
        ? `คุณกำลังวิเคราะห์ใน "โหมดเทรดสายซิ่ง (Fast Scalping / Speed Trading Mode)" บน Multi-Timeframe ครบทุก 6 กรอบเวลา (H4, H1, M30, M15, M5, M1)
- หลักการวิเคราะห์: ต้องเช็คภาพรวมภาพกว้างจาก Timeframe ใหญ่ H4, H1 และ M30 ก่อนเสมอ เพื่อดักจับ Major Trend / Structure & Key Supply-Demand Zone คุมไว้ เพิ่มความแม่นยำสูงสุดและป้องกันการโดนหลอกสวนเทรนด์
- วิเคราะห์จุดย่อเด้ง (Pullback & Setup Zone) บน M15 และ M5
- ค้นหาจุดเข้าเทรดที่คมกริบที่สุดใน Timeframe M1 (Sniper Entry M1) เพื่อคำนวณจุด Stop Loss ให้แคบที่สุด โดนลากน้อยที่สุด (Minimal Drawdown) และได้อัตราส่วน Risk-to-Reward (R:R) สูงสุด
- สแกนดูจุดเด้ง Rejection Spike / Micro ChoCH / M1 Order Block / M1 FVG`
        : `คุณกำลังวิเคราะห์ในโหมดมาตรฐาน Multi-timeframe (H4, H1, M15)`;

      const systemPrompt = `คุณคือ Pro Senior Financial Trading Analyst และ AI Trading Expert ผู้เชี่ยวชาญระดับสถาบัน (Institutional Trader).
หน้าที่ของคุณคือ ${modeHeaderPrompt} ด้วยระบบการเทรด "${strategy}" ตามคำแนะนำต่อไปนี้:

${strategyGuide[strategy] || strategyGuide['SMC']}

${customNotes ? `คำแนะนำเพิ่มเติมจากผู้ใช้: "${customNotes}"` : ''}

คำแนะนำสำคัญในการวิเคราะห์:
1. วิเคราะห์ราคาและแนวโน้มจากกราฟในรูปอย่างสมจริง แม่นยำ
2. ตรวจหาตัวย่อ/ชื่อคู่เงิน (เช่น XAUUSD, EURUSD, BTCUSD) จากรูปภาพ ถ้าไม่มีให้ระบุประเภทสินทรัพย์ตามทรงกราฟ
3. ประเมินว่าสัญญาณเทรดเป็น "BUY", "SELL" หรือ "NO_TRADE" (ถ้าโครงสร้างราคาไม่ชัดเจนหรือเสี่ยงสูงเกินไป ให้ตอบ NO_TRADE)
4. คำนวณจุด Entry, SL, TP1, TP2, TP3 และ Risk:Reward Ratio (R:R) ที่แม่นยำ สมเหตุสมผลตามโครงสร้างราคาจริงในภาพ ${isScalpMode ? '(สำหรับสายซิ่ง เน้นอิงกรอบ H4/M30 เพื่อความแม่นยำ แล้วเลือกจุดเข้า M1 ที่ SL แคบ โดนลากน้อย R:R สูง)' : ''}
5. สร้าง "ตารางสรุปเงื่อนไขและเหตุผลประกอบการตัดสินใจ" (Summary Conditions) ให้เป็นขั้นตอน เช่น Alignment ${isScalpMode ? 'H4/M30 -> M15/M5' : 'H4 -> H1'}, Liquidity Sweep, FVG Fill, Entry Trigger ${isScalpMode ? 'M1' : 'M15'}
6. ระบุจุด invalidationScenario (เมื่อไหร่ที่แผนเทรดนี้จะยกเลิก) และ tradeManagement (การบริหารออเดอร์ เช่น เลื่อน SL มา BE เมื่อถึง TP1)
7. ประมาณค่าตำแหน่ง visual overlay (0-100%) บนภาพกราฟ ${isScalpMode ? 'M1' : 'M15'} เพื่อนำไปวาดเส้น Entry (เขียว), SL (แดง), TP (ฟ้า) และกล่อง Order Block / FVG บนหน้าจอให้ผู้ใช้เห็นชัดเจน

โปรดส่งออกผลลัพธ์เป็น JSON ภาษาไทยตามโครงสร้างนี้อย่างเคร่งครัด:`;

      parts.push({ text: systemPrompt });

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING, description: 'ชื่อคู่เงิน/สินทรัพย์ เช่น XAU/USD (ทองคำ), EUR/USD, BTC/USDT' },
          signal: { type: Type.STRING, description: 'สัญญาณเทรด: BUY, SELL, หรือ NO_TRADE' },
          confidenceScore: { type: Type.NUMBER, description: 'คะแนนความมั่นใจ 0-100%' },
          overallReasoning: { type: Type.STRING, description: 'สรุปเหตุผลหลักสั้นๆ ชัดเจน ภาษาไทย' },
          marketStructure: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeframe: { type: Type.STRING, description: isScalpMode ? 'H4, M30, M15, M5, หรือ M1' : 'H4, H1, หรือ M15' },
                trend: { type: Type.STRING, description: 'Bullish, Bearish, หรือ Sideways / Ranging' },
                summary: { type: Type.STRING, description: 'คำอธิบายโครงสร้างราคาใน TF นี้' },
                keyLevel: { type: Type.STRING, description: 'ระดับราคาสำคัญใน TF นี้' },
              },
              required: ['timeframe', 'trend', 'summary', 'keyLevel'],
            },
          },
          tradeSetup: {
            type: Type.OBJECT,
            properties: {
              entryType: { type: Type.STRING, description: 'Limit Order, Market Execution, หรือ Stop Order' },
              entryPrice: { type: Type.STRING, description: 'ราคาเข้าเทรด เช่น 2385.50' },
              entryPriceValue: { type: Type.NUMBER, description: 'ตัวเลขราคาเข้าเทรด' },
              stopLoss: { type: Type.STRING, description: 'ราคาตัดขาดทุน Stop Loss เช่น 2380.00' },
              stopLossValue: { type: Type.NUMBER, description: 'ตัวเลขราคา SL' },
              takeProfit1: { type: Type.STRING, description: 'ราคาทำกำไร TP1 เช่น 2394.00' },
              takeProfit1Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP1' },
              takeProfit2: { type: Type.STRING, description: 'ราคาทำกำไร TP2 เช่น 2402.00' },
              takeProfit2Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP2' },
              takeProfit3: { type: Type.STRING, description: 'ราคาทำกำไร TP3 เช่น 2415.00' },
              takeProfit3Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP3' },
              riskRewardRatio: { type: Type.STRING, description: 'อัตรา Risk:Reward เช่น 1 : 3.2' },
              estimatedPipsSL: { type: Type.NUMBER, description: 'ระยะ SL ในหน่วย Pips / Points' },
              recommendedRiskPercent: { type: Type.STRING, description: 'เปอร์เซ็นต์ความเสี่ยงที่แนะนำต่อไม้ เช่น 1% - 2%' },
            },
            required: [
              'entryType', 'entryPrice', 'entryPriceValue', 
              'stopLoss', 'stopLossValue', 
              'takeProfit1', 'takeProfit1Value',
              'takeProfit2', 'takeProfit2Value',
              'takeProfit3', 'takeProfit3Value',
              'riskRewardRatio', 'estimatedPipsSL', 'recommendedRiskPercent'
            ],
          },
          confluences: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'รายการเหตุผลซัพพอร์ต (Confluence points) ภาษาไทย',
          },
          summaryConditions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.NUMBER, description: 'ลำดับขั้นตอน 1, 2, 3...' },
                topic: { type: Type.STRING, description: 'หัวข้อการตรวจสอบเงื่อนไข' },
                conditionMet: { type: Type.BOOLEAN, description: 'เงื่อนไขผ่านหรือไม่ true/false' },
                timeframe: { type: Type.STRING, description: 'H4, H1, M15 หรือ All' },
                details: { type: Type.STRING, description: 'คำอธิบายเงื่อนไขละเอียด ภาษาไทย' },
                ruleType: { type: Type.STRING, description: 'ประเภทกฎ เช่น Higher TF Bias, Liquidity, Trigger' },
              },
              required: ['step', 'topic', 'conditionMet', 'timeframe', 'details', 'ruleType'],
            },
          },
          invalidationScenario: { type: Type.STRING, description: 'สถานการณ์ที่ทำให้แผนเทรดนี้โมฆะ' },
          tradeManagement: { type: Type.STRING, description: 'กลยุทธ์การบริหารความเสี่ยงและจัดการออเดอร์' },
          overlayCoords: {
            type: Type.OBJECT,
            properties: {
              entryYPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ Entry บนกราฟ (0=บนสุด, 100=ล่างสุด)' },
              slYPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ SL บนกราฟ (0-100)' },
              tp1YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP1 บนกราฟ (0-100)' },
              tp2YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP2 บนกราฟ (0-100)' },
              tp3YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP3 บนกราฟ (0-100)' },
              keyZones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'ORDER_BLOCK, FAIR_VALUE_GAP, LIQUIDITY_SWEEP, CHOCH, SUPPORT_RESISTANCE' },
                    label: { type: Type.STRING, description: 'ชื่อโซน เช่น H4 Demand, H1 FVG' },
                    timeframe: { type: Type.STRING },
                    yPercentMin: { type: Type.NUMBER, description: 'ขอบบนโซน Y% (0-100)' },
                    yPercentMax: { type: Type.NUMBER, description: 'ขอบล่างโซน Y% (0-100)' },
                    xPercentMin: { type: Type.NUMBER, description: 'ขอบซ้ายโซน X% (0-100)' },
                    xPercentMax: { type: Type.NUMBER, description: 'ขอบขวาโซน X% (0-100)' },
                    colorHex: { type: Type.STRING, description: 'สีโซน เช่น #10B981 หรือ #EF4444' },
                  },
                  required: ['id', 'type', 'label', 'timeframe', 'yPercentMin', 'yPercentMax', 'xPercentMin', 'xPercentMax', 'colorHex'],
                }
              }
            },
            required: ['entryYPercent', 'slYPercent', 'tp1YPercent', 'tp2YPercent', 'tp3YPercent', 'keyZones']
          }
        },
        required: [
          'symbol', 'signal', 'confidenceScore', 'overallReasoning',
          'marketStructure', 'tradeSetup', 'confluences',
          'summaryConditions', 'invalidationScenario', 'tradeManagement', 'overlayCoords'
        ],
      };

      let parsedData: any = null;

      try {
        const ai = getAi(customApiKey);
        let result: any;
        try {
          result = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: { parts },
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.2, // Low temperature for consistent financial analysis
            },
          });
        } catch (primaryModelErr: any) {
          console.warn('Primary model gemini-3.6-flash error, trying fallback gemini-flash-latest:', primaryModelErr?.message);
          result = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: { parts },
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.2,
            },
          });
        }

        const responseText = result.text;
        if (responseText) {
          parsedData = JSON.parse(responseText);
        } else {
          throw new Error('ไม่ได้รับผลวิเคราะห์กลับมาจาก Google Gemini');
        }
      } catch (geminiErr: any) {
        console.error('Gemini API call failed for user API key:', geminiErr?.message || geminiErr);
        const msg = geminiErr?.message || String(geminiErr);
        return res.status(400).json({
          error: `เกิดข้อผิดพลาดในการวิเคราะห์ด้วย Gemini API Key ของคุณ: ${msg} (กรุณาตรวจสอบว่า API Key ส่วนตัวของคุณถูกต้องและมีโควตาใน Google AI Studio)`
        });
      }

      // Add server-assigned ID & metadata
      const finalResult = {
        id: 'analysis_' + Date.now(),
        timestamp: new Date().toISOString(),
        strategyUsed: strategy,
        images: {
          h4Image: h4Image || null,
          h1Image: h1Image || null,
          m15Image: m15Image || null,
        },
        ...parsedData,
      };

      // Push to Admin Analysis Logs
      analysisLogs.unshift({
        id: 'log_' + Date.now(),
        userId: 'usr_active',
        userName: 'ผู้ใช้ระบบ',
        symbol: finalResult.symbol || 'Gold / Forex',
        strategy: strategy,
        signal: finalResult.signal || 'BUY',
        confidenceScore: finalResult.confidenceScore || 85,
        timestamp: finalResult.timestamp,
      });

      res.json(finalResult);

    } catch (err: any) {
      console.error('Error analyzing charts:', err);
      res.status(400).json({ 
        error: err.message || 'เกิดข้อผิดพลาดระหว่างการวิเคราะห์ด้วย AI กรุณาลองใหม่อีกครั้ง'
      });
    }
  });

  // API Endpoint: Position Audit & Active Order Review (วิเคราะห์ออเดอร์ที่เข้าไป)
  app.post('/api/audit-position', async (req, res) => {
    try {
      const {
        customApiKey,
        chartImage,
        orderType = 'BUY',
        timeframe = 'M15',
        symbol = 'XAU/USD',
        entryPrice = '',
        currentPrice = '',
        stopLoss = '',
        takeProfit = '',
        notes = ''
      } = req.body;

      if (!customApiKey || !customApiKey.trim()) {
        return res.status(400).json({
          error: 'กรุณาระบุ Google Gemini API Key ส่วนตัวของคุณในช่องตั้งค่าก่อนวิเคราะห์ออเดอร์ (ระบบใช้ API Key และเครดิตของบัญชีคุณเอง)'
        });
      }

      if (!chartImage) {
        return res.status(400).json({ error: 'กรุณาแนบรูปภาพกราฟออเดอร์ที่ต้องการวิเคราะห์' });
      }

      // Convert Base64 Image to Gemini Part
      const matches = chartImage.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'รูปแบบรูปภาพกราฟไม่ถูกต้อง กรุณาอัปโหลดรูปภาพใหม่' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      const parts = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: `คุณคือผู้เชี่ยวชาญการเทรดสถาบัน (Institutional Master Trader) ทำหน้าที่ "วิเคราะห์ประเมินออเดอร์ที่เปิดอยู่" (Active Position Audit & Review)
ข้อมูลการเข้าเทรดของผู้ใช้:
- ออเดอร์ประเภท: ${orderType}
- สินทรัพย์ / คู่เงิน: ${symbol || 'XAU/USD'}
- Timeframe ที่ใช้ดู: ${timeframe || 'M15'}
- ราคาเข้าออเดอร์ (Entry Price): ${entryPrice || 'ดูตามจุดเปิดบนกราฟ'}
- ราคาปัจจุบัน (Current Price): ${currentPrice || 'ดูตามราคาปัจจุบันบนกราฟ'}
- Stop Loss (SL): ${stopLoss || 'ไม่ได้ระบุ'}
- Take Profit (TP): ${takeProfit || 'ไม่ได้ระบุ'}
- เหตุผลการเข้า/หมายเหตุเพิ่มเติม: ${notes || 'ไม่มี'}

หน้าที่ของคุณ:
1. วิเคราะห์รูปภาพกราฟที่ส่งมาอย่างละเอียด
2. ประเมินสภาวะราคาปัจจุบัน (Candlestick Momentum, Structure, Supply/Demand Zone, Fair Value Gap, Market Structure, Support/Resistance)
3. ระบุข้อควรระวังสำคัญ (Caution Points / Hazards) เช่น ชนแนวต้าน/แนวรับสำคัญ, เกิด Divergence, แท่งเทียน Rejection หางยาว หรือมีโอกาสเป็น Fakeout
4. ให้คะแนนคุณภาพจุดเข้าเทรด (Quality Score 0-100)
5. สรุปคำแนะนำชัดเจนที่สุด (recommendation):
   - "HOLD" = ถือออเดอร์ต่อไป (กราฟยังตามแผน ไม่มีสัญญาณกลับตัวรุนแรง)
   - "PARTIAL_CLOSE" = ขยับ SL มาบังทุน (Breakeven) / แบ่งปิดทำกำไรบางส่วน (มีแนวต้าน/รับใกล้อยู่ หรือเริ่มชะลอตัว)
   - "CLOSE_NOW" = แนะนำปิดออเดอร์ทันที / ตัดขาดทุน (โครงสร้างราคาเสีย หรือเกิดสัญญาณ Reversal ชัดเจน)
6. ให้คำแนะนำการจัดการออเดอร์ (Management Advice) ที่นำไปปฏิบัติได้จริงทันที
ตอบเป็นภาษาไทยด้วยความแม่นยำทางเทคนิคอลขั้นสูง`
        }
      ];

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          recommendation: { type: Type.STRING, description: 'MUST BE exact string: HOLD, PARTIAL_CLOSE, or CLOSE_NOW' },
          recommendationTitle: { type: Type.STRING, description: 'หัวข้อคำแนะนำภาษาไทย เช่น ถือออเดอร์ต่อไป (HOLD), แบ่งปิดทำกำไร / SL บังทุน, ปิดออเดอร์ทันที (CLOSE NOW)' },
          recommendationSummary: { type: Type.STRING, description: 'สรุปเหตุผลหลักของคำแนะนำสั้นกระชับ ภาษาไทย' },
          qualityScore: { type: Type.NUMBER, description: 'คะแนนคุณภาพจุดเข้าเทรด 0 ถึง 100' },
          structureAnalysis: { type: Type.STRING, description: 'วิเคราะห์สภาวะกราฟ แท่งเทียน และโครงสร้างราคาละเอียด ภาษาไทย' },
          cautionPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'รายการจุดข้อควรระวังหรือความเสี่ยงที่ต้องระวัง 3-5 ข้อ'
          },
          managementAdvice: { type: Type.STRING, description: 'คำแนะนำขั้นตอนการจัดการออเดอร์ถัดไป ภาษาไทย' },
          targetAdjustment: {
            type: Type.OBJECT,
            properties: {
              suggestedSl: { type: Type.STRING },
              suggestedTp: { type: Type.STRING },
              trailingStopPips: { type: Type.STRING }
            }
          }
        },
        required: ['symbol', 'recommendation', 'recommendationTitle', 'recommendationSummary', 'qualityScore', 'structureAnalysis', 'cautionPoints', 'managementAdvice']
      };

      let auditData: any = null;

      try {
        const ai = getAi(req.body?.customApiKey);
        let result: any;
        try {
          result = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: { parts },
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.2,
            },
          });
        } catch (primaryModelErr: any) {
          console.warn('Primary model gemini-3.6-flash error in audit-position, trying fallback gemini-flash-latest:', primaryModelErr?.message);
          result = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: { parts },
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.2,
            },
          });
        }

        const responseText = result.text;
        if (responseText) {
          auditData = JSON.parse(responseText);
        } else {
          throw new Error('ไม่ได้รับผลประเมินออเดอร์กลับมาจาก Google Gemini');
        }
      } catch (geminiErr: any) {
        console.error('Gemini API Position Audit failed for user key:', geminiErr?.message || geminiErr);
        const msg = geminiErr?.message || String(geminiErr);
        return res.status(400).json({
          error: `เกิดข้อผิดพลาดในการวิเคราะห์ด้วย Gemini API Key ของคุณ: ${msg} (กรุณาตรวจสอบว่า API Key ส่วนตัวของคุณถูกต้องและมีโควตาใน Google AI Studio)`
        });
      }

      const finalAuditResult = {
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString(),
        orderType,
        timeframe,
        entryPrice,
        currentPrice,
        stopLoss,
        takeProfit,
        notes,
        chartImageBase64: chartImage,
        ...auditData
      };

      res.json(finalAuditResult);

    } catch (err: any) {
      console.error('Error in position audit:', err);
      res.status(500).json({
        error: err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ออเดอร์ กรุณาลองใหม่อีกครั้ง'
      });
    }
  });

  // Interactive Position Audit Consultation Chat Endpoint
  app.post('/api/audit-consult', async (req, res) => {
    try {
      const { question, history = [], positionInfo = {}, chartImageBase64, customApiKey } = req.body || {};

      const effectiveKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
      if (!effectiveKey) {
        return res.status(400).json({
          error: 'กรุณากรอก Google Gemini API Key ในช่องตั้งค่า หรือใช้งานผ่านระบบที่กำหนด'
        });
      }

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'กรุณาระบุคำถามที่ต้องการปรึกษา' });
      }

      const parts: any[] = [];

      // Include chart image if present
      if (chartImageBase64) {
        const matches = chartImageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
        }
      }

      // System context
      const systemPrompt = `คุณคือ AI Senior Trader & Risk Management Advisor (โค้ช/ที่ปรึกษาเทรดเดอร์มืออาชีพ) ที่มีความเชี่ยวชาญด้านสภาวะตลาด การบริหารความเสี่ยง และจิตวิทยาการเทรด 
ขณะนี้คุณกำลังตอบคำถามให้คำปรึกษาแก่เทรดเดอร์เกี่ยวกับ "ออเดอร์ที่เขากำลังเปิดอยู่ปัจจุบัน (Active Position)"

ข้อมูลออเดอร์ของผู้เทรด (Active Position Context):
- สินทรัพย์/คู่เงิน: ${positionInfo.symbol || 'N/A'}
- ประเภทออเดอร์: ${positionInfo.orderType || 'N/A'} (Entry: ${positionInfo.entryPrice || 'ไม่ระบุ'}, Current: ${positionInfo.currentPrice || 'ไม่ระบุ'})
- Timeframe: ${positionInfo.timeframe || 'N/A'}
- Stop Loss: ${positionInfo.stopLoss || 'ไม่ระบุ'}, Take Profit: ${positionInfo.takeProfit || 'ไม่ระบุ'}
- หมายเหตุ/เหตุผลที่เข้า: ${positionInfo.notes || 'ไม่มี'}

ผลการประเมินจาก AI ล่าสุด:
- ผลลัพธ์: ${positionInfo.recommendationTitle || positionInfo.recommendation || ''}
- คะแนนจุดเข้า: ${positionInfo.qualityScore || '-'}/100
- สรุปสภาวะกราฟ: ${positionInfo.structureAnalysis || ''}
- ข้อควรระวัง: ${Array.isArray(positionInfo.cautionPoints) ? positionInfo.cautionPoints.join('; ') : ''}
- คำแนะนำการจัดการ: ${positionInfo.managementAdvice || ''}

แนวทางการตอบคำถาม:
1. ตอบด้วยความเป็นกันเอง เป็นผู้รู้ที่หวังดี ตรงประเด็น สั้นกระชับเข้าใจง่าย
2. ให้คำแนะนำเชิงการปฏิบัติจริง เช่น การปรับจุด SL มาบังทุน (Breakeven), การแบ่งปิดทำกำไร (Partial Close), การรับมือกับข่าวผันผวน หรือการจัดการความเสี่ยงตามหลัก Risk-to-Reward
3. หากผู้ใช้ถามสถานการณ์สมมติ ให้วิเคราะห์ทางเลือกที่ดีที่สุดตามโครงสร้างราคาจริงบนกราฟ
4. ใช้ภาษาไทย สุภาพ และเสริมสร้างความมั่นใจอย่างมีสติ`;

      parts.push({ text: systemPrompt });

      // Add conversation history
      if (Array.isArray(history) && history.length > 0) {
        let historyStr = '\nประวัติการสนทนาก่อนหน้านี้:\n';
        for (const msg of history) {
          historyStr += `${msg.role === 'user' ? 'ผู้ใช้' : 'AI Advisor'}: ${msg.content}\n`;
        }
        parts.push({ text: historyStr });
      }

      parts.push({ text: `\nคำถามล่าสุดจากผู้ใช้: "${question.trim()}"\n\nโปรดตอบคำถามนี้ในฐานะ AI Trade Advisor:` });

      const ai = getAi(customApiKey);
      let resultText = '';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts },
          config: {
            temperature: 0.4,
          }
        });
        resultText = response.text || '';
      } catch (errPrimary: any) {
        console.warn('Primary model error in audit-consult, using fallback:', errPrimary?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: { parts },
          config: {
            temperature: 0.4,
          }
        });
        resultText = response.text || '';
      }

      if (!resultText) {
        throw new Error('ไม่ได้รับคำตอบจาก AI Advisor');
      }

      res.json({ reply: resultText });

    } catch (err: any) {
      console.error('Error in audit consult endpoint:', err);
      res.status(400).json({
        error: err.message || 'เกิดข้อผิดพลาดในการรับคำตอบจาก AI Advisor'
      });
    }
  });

  // Daily Market Analysis & Bias Endpoint
  app.post('/api/daily-analysis', async (req, res) => {
    try {
      const { symbol = 'XAU/USD (Gold)', chartImageBase64, customNotes = '', customApiKey } = req.body || {};

      const effectiveKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
      if (!effectiveKey) {
        return res.status(400).json({
          error: 'กรุณากรอก Google Gemini API Key ในช่องตั้งค่า หรือใช้งานผ่านระบบที่กำหนด'
        });
      }

      const parts: any[] = [];

      // Include chart image if uploaded
      if (chartImageBase64) {
        const matches = chartImageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: { mimeType: matches[1], data: matches[2] }
          });
        }
      }

      const prompt = `คุณคือ AI Head Trader & Market Strategist ประจำสถาบันการเงินระดับโลก 
ทำหน้าที่วิเคราะห์สภาวะตลาดประจำวัน (Daily Market Regime & Advantage Analysis) สำหรับสินทรัพย์: "${symbol}"
${customNotes ? `หมายเหตุเพิ่มเติมจากเทรดเดอร์: "${customNotes}"` : ''}

เป้าหมายสำคัญ:
1. ประเมินว่าตลาดกำลังอยู่ในสภาวะใด:
   - 'STRONG_UPTREND' (เทรนด์ขาขึ้นแข็งแกร่ง)
   - 'STRONG_DOWNTREND' (เทรนด์ขาลงแข็งแกร่ง)
   - 'SIDEWAYS_RANGE' (ไซด์เวย์ในกรอบสะสมราคา / Ranging Box)
   - 'SIDEWAYS_VOLATILE' (ไซด์เวย์ผันผวนสูง / Choppy Expansion)
   - 'BREAKOUT_PENDING' (กำลังอัดตัวรอการระเบิด Breakout)

2. ประเมินว่าการเปิดออเดอร์ฝั่งไหนที่จะได้เปรียบตลาดมากที่สุดในวันนี้ (Statistical Advantage):
   - 'BUY_ADVANTAGE' (ฝั่ง BUY ได้เปรียบสูง เน้นย่อ BUY ตามเทรนด์)
   - 'SELL_ADVANTAGE' (ฝั่ง SELL ได้เปรียบสูง เน้นเด้ง SELL ตามเทรนด์)
   - 'WAIT_SIDEWAYS' (ตลาดไซด์เวย์ไร้ทิศทาง แนะนำชะลอการเทรดหรือรอเบรกกรอบ)
   - 'BOTH_SIDES_RANGE' (เล่นได้ทั้งสองฝั่งตามกรอบแนวรับ-แนวต้าน ไซด์เวย์ชัดเจน)

3. ระบุแนวรับสำคัญ (Demand / Support Zones) และแนวต้านสำคัญ (Supply / Resistance Zones) ประจำวัน
4. วางแผนการเทรดประจำวัน (Daily Trade Plan) ทั้งแผน BUY, แผน SELL และเงื่อนไขที่ไม่ควรเข้าเทรด (No-Trade Rule)

โปรดตอบกลับเป็น JSON บริสุทธิ์เท่านั้น (Pure JSON) ในโครงสร้างดังต่อไปนี้:
{
  "marketCondition": "STRONG_UPTREND" | "STRONG_DOWNTREND" | "SIDEWAYS_RANGE" | "SIDEWAYS_VOLATILE" | "BREAKOUT_PENDING",
  "marketConditionTitle": "ชื่อสภาวะตลาดภาษาไทย เช่น เทรนด์ขาขึ้นแข็งแกร่ง (Strong Uptrend)",
  "preferredSide": "BUY_ADVANTAGE" | "SELL_ADVANTAGE" | "WAIT_SIDEWAYS" | "BOTH_SIDES_RANGE",
  "preferredSideTitle": "หัวข้อฝั่งที่ได้เปรียบภาษาไทย เช่น ฝั่ง BUY ได้เปรียบสูง (Bullish Advantage)",
  "advantageSummary": "คำอธิบายละเอียดว่าทำไมฝั่งนี้ถึงได้เปรียบ สภาวะโครงสร้างราคาปัจจุบัน โครงสร้าง HH/HL หรือ LH/LL และแรงซื้อขายในตลาด",
  "keyLevels": {
    "resistanceZones": ["แนวต้าน 1 / Supply Zone 1", "แนวต้าน 2 / Major Supply"],
    "supportZones": ["แนวรับ 1 / Demand Zone 1", "แนวรับ 2 / Major Demand"],
    "pivotPoint": "ระดับราคา Pivot / จุดเปลี่ยนฝั่งได้เปรียบ"
  },
  "dailyStrategy": "สรุปกลยุทธ์การเทรดประจำวันที่ได้เปรียบที่สุด เช่น รอย่อทดสอบ Demand Zone M15/H1 แล้วหาจังหวะ BUY",
  "riskFactors": [
    "ปัจจัยความเสี่ยงที่ 1 เช่น ข่าวตัวเลขเศรษฐกิจผันผวนช่วงค่ำ",
    "ปัจจัยความเสี่ยงที่ 2"
  ],
  "tradingPlan": {
    "buyPlan": "แผนการเข้า BUY: ถ้าราคาถอยมาบริเวณ ... แล้วเกิดสัญญาณกลับตัว ให้เข้า BUY เป้าหมายที่ ...",
    "sellPlan": "แผนการเข้า SELL: ถ้าราคาปรับขึ้นไปทดสอบ ... แล้วปฏิเสธราคา ให้ SELL เป้าหมายที่ ...",
    "noTradeCondition": "เงื่อนไขการงดเทรด: เช่น หากราคาหลุดแนวรับ ... หรือช่วงก่อนข่าวออก 15 นาที"
  }
}`;

      parts.push({ text: prompt });

      const ai = getAi(customApiKey);
      let jsonText = '';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts },
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          }
        });
        jsonText = response.text || '';
      } catch (errPrimary: any) {
        console.warn('Primary model error in daily-analysis, trying fallback:', errPrimary?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: { parts },
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          }
        });
        jsonText = response.text || '';
      }

      // Clean JSON formatting
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(jsonText);

      const resultData = {
        id: 'daily_' + Date.now(),
        timestamp: new Date().toISOString(),
        symbol,
        marketCondition: parsedData.marketCondition || 'SIDEWAYS_RANGE',
        marketConditionTitle: parsedData.marketConditionTitle || 'สภาวะตลาดไซด์เวย์',
        preferredSide: parsedData.preferredSide || 'WAIT_SIDEWAYS',
        preferredSideTitle: parsedData.preferredSideTitle || 'รอความชัดเจนของสภาวะตลาด',
        advantageSummary: parsedData.advantageSummary || 'ตลาดกำลังอยู่ในช่วงปรับฐาน รอการยืนยันโครงสร้าง',
        keyLevels: {
          resistanceZones: Array.isArray(parsedData.keyLevels?.resistanceZones) ? parsedData.keyLevels.resistanceZones : [],
          supportZones: Array.isArray(parsedData.keyLevels?.supportZones) ? parsedData.keyLevels.supportZones : [],
          pivotPoint: parsedData.keyLevels?.pivotPoint || 'N/A'
        },
        dailyStrategy: parsedData.dailyStrategy || 'เน้นการตั้งรับบริเวณกรอบแนวรับแนวต้านสำคัญ',
        riskFactors: Array.isArray(parsedData.riskFactors) ? parsedData.riskFactors : [],
        tradingPlan: {
          buyPlan: parsedData.tradingPlan?.buyPlan || '',
          sellPlan: parsedData.tradingPlan?.sellPlan || '',
          noTradeCondition: parsedData.tradingPlan?.noTradeCondition || ''
        }
      };

      res.json(resultData);

    } catch (err: any) {
      console.error('Error in daily analysis endpoint:', err);
      res.status(500).json({
        error: err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์สภาวะตลาดประจำวัน'
      });
    }
  });


  // Global Express Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Express Handler Captured Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'เกิดข้อผิดพลาดในการรับส่งข้อมูลขนาดใหญ่ กรุณาลองใหม่อีกครั้ง'
    });
  });

  // Serve frontend files
  async function initServer() {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }

  initServer();

export default app;
