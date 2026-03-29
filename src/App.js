import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import './App.css';

// ========== ДАННЫЕ ПО УМОЛЧАНИЮ ==========
const DEFAULT_COUPLE = {
  groom: { name: 'Алексей', fullName: 'Алексей Соколов' },
  bride: { name: 'Анна', fullName: 'Анна Волкова' },
  weddingDate: '2025-06-15T15:00:00',
  location: 'Ресторан "Grand Hall", Москва, ул. Пушкина, 15',
  dressCode: 'Formal / Evening Dress (пастельные тона)',
  welcomeText: 'С любовью приглашаем вас разделить с нами этот особенный день!'
};

const DEFAULT_PROGRAM = [
  { time: '14:30', title: 'Сбор гостей', description: 'Встреча гостей, welcome-drink', icon: '🥂' },
  { time: '15:00', title: 'Торжественная церемония', description: 'Регистрация брака, обмен клятвами', icon: '💍' },
  { time: '16:00', title: 'Фотосессия', description: 'Совместные фото с гостями', icon: '📸' },
  { time: '17:00', title: 'Банкет', description: 'Ресторан, тосты, танцы', icon: '🍽️' },
  { time: '22:00', title: 'Фейерверк', description: 'Праздничный салют', icon: '🎆' }
];

const DEFAULT_GIFTS = [
  { icon: '💰', title: 'Денежный подарок', description: 'Будем рады любому вниманию' },
  { icon: '🏠', title: 'Для дома', description: 'Техника, посуда, текстиль' },
  { icon: '✈️', title: 'Впечатления', description: 'Путешествия, сертификаты' }
];

// ========== ЗАЩИТА АДМИНКИ ==========
const ADMIN_PASSWORD = 'admin123';

function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Неверный пароль');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h2>🔐 Вход в админ-панель</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

// ========== ГЛАВНЫЙ КОМПОНЕНТ ==========
function App() {
  const [couple, setCouple] = useState(() => {
    const saved = localStorage.getItem('wedding_couple');
    return saved ? JSON.parse(saved) : DEFAULT_COUPLE;
  });
  const [program, setProgram] = useState(() => {
    const saved = localStorage.getItem('wedding_program');
    return saved ? JSON.parse(saved) : DEFAULT_PROGRAM;
  });
  const [gifts, setGifts] = useState(() => {
    const saved = localStorage.getItem('wedding_gifts');
    return saved ? JSON.parse(saved) : DEFAULT_GIFTS;
  });
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('wedding_guests');
    return saved ? JSON.parse(saved) : [];
  });
  const [rsvp, setRsvp] = useState(() => {
    const saved = localStorage.getItem('wedding_rsvp');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => localStorage.setItem('wedding_couple', JSON.stringify(couple)), [couple]);
  useEffect(() => localStorage.setItem('wedding_program', JSON.stringify(program)), [program]);
  useEffect(() => localStorage.setItem('wedding_gifts', JSON.stringify(gifts)), [gifts]);
  useEffect(() => localStorage.setItem('wedding_guests', JSON.stringify(guests)), [guests]);
  useEffect(() => localStorage.setItem('wedding_rsvp', JSON.stringify(rsvp)), [rsvp]);

  const addGuest = (guestData) => {
    const newGuest = { id: Date.now(), ...guestData, code: Math.random().toString(36).substring(2, 8).toUpperCase() };
    setGuests([...guests, newGuest]);
    return newGuest;
  };

  const updateGuest = (id, data) => setGuests(guests.map(g => g.id === id ? { ...g, ...data } : g));
  const deleteGuest = (id) => setGuests(guests.filter(g => g.id !== id));
  const updateRsvp = (guestCode, data) => setRsvp({ ...rsvp, [guestCode]: data });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage guests={guests} />} />
        <Route path="/invite/:guestCode" element={<InvitationPage couple={couple} program={program} gifts={gifts} guests={guests} rsvp={rsvp} updateRsvp={updateRsvp} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel couple={couple} setCouple={setCouple} program={program} setProgram={setProgram} gifts={gifts} setGifts={setGifts} guests={guests} addGuest={addGuest} updateGuest={updateGuest} deleteGuest={deleteGuest} rsvp={rsvp} /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

// ========== ЛЕНДИНГ ==========
function LandingPage({ guests }) {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const guest = guests.find(g => g.code === code.toUpperCase());
    if (guest) navigate(`/invite/${guest.code}`);
    else alert('Код не найден. Пожалуйста, проверьте ваше приглашение.');
  };

  return (
    <div className="landing-page">
      <div className="landing-bg"><div className="floating-hearts">{[...Array(20)].map((_, i) => (<div key={i} className="heart" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${5 + Math.random() * 10}s` }}>❤️</div>))}</div></div>
      <div className="landing-container">
        <motion.div className="landing-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="wedding-ring">💍</div>
          <h1>Приглашение на свадьбу</h1>
          <h2>Алексей <span className="ampersand">&</span> Анна</h2>
          <div className="date">15 Июня 2025</div>
          <form onSubmit={handleSubmit} className="code-form">
            <input type="text" placeholder="Введите код из приглашения" value={code} onChange={(e) => setCode(e.target.value)} required />
            <button type="submit">Открыть приглашение →</button>
          </form>
          <div className="landing-footer"><p>Код указан в вашем именном приглашении</p><button className="admin-link" onClick={() => window.location.href='/admin'}>🔐 Администраторам</button></div>
        </motion.div>
      </div>
    </div>
  );
}

// ========== ФУНКЦИЯ ДЛЯ ОБРАЩЕНИЯ ==========
function getGreeting(guest) {
  if (guest.type === 'family') {
    return `Уважаемая семья ${guest.lastName || guest.fullName}!`;
  }
  if (guest.type === 'couple') {
    return `Дорогие ${guest.name} и ${guest.partnerName || 'спутник(ца)'}!`;
  }
  if (guest.gender === 'male') {
    return `Дорогой ${guest.name}!`;
  }
  if (guest.gender === 'female') {
    return `Дорогая ${guest.name}!`;
  }
  return `Дорогой(ая) ${guest.name}!`;
}

// ========== СТРАНИЦА ПРИГЛАШЕНИЯ ==========
function InvitationPage({ couple, program, gifts, guests, rsvp, updateRsvp }) {
  const { guestCode } = useParams();
  const [guest, setGuest] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ attending: '', guests: 1, wishes: '' });
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const found = guests.find(g => g.code === guestCode);
    if (found) {
      setGuest(found);
      const savedRsvp = rsvp[guestCode];
      if (savedRsvp) setFormData(savedRsvp);
    } else navigate('/');
  }, [guestCode, guests, rsvp, navigate]);

  const weddingDate = new Date(couple.weddingDate);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = weddingDate - now;
      if (diff > 0) setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    if (audioRef.current) audioRef.current.play().catch(e => console.log('Audio play blocked'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRsvp(guestCode, formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!guest) return null;

  const greeting = getGreeting(guest);
  const invitationText = guest.type === 'family' 
    ? `Приглашаем вас разделить с нами радость этого особенного дня!`
    : `Приглашаем вас разделить с нами радость этого особенного дня!`;

  return (
    <div className="invitation-app">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.2} />}
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
      
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div className="envelope-wrapper" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            <div className={`invitation-envelope ${isHovered ? 'hover' : ''}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleOpen}>
              <div className="envelope-back"></div>
              <div className="envelope-front-new">
                <div className="envelope-flap-new">
                  <div className="flap-line"></div>
                </div>
                <div className="envelope-body-new">
                  <div className="envelope-content">
                    <div className="envelope-stamp">💌</div>
                    <div className="envelope-address-new">
                      <div className="envelope-to">Именное приглашение</div>
                      <div className="envelope-name">{guest.fullName}</div>
                      <div className="envelope-code">Код: {guest.code}</div>
                    </div>
                    <div className="envelope-seal-new"></div>
                  </div>
                  <div className="open-hint">Нажмите, чтобы открыть →</div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div className="invitation-content" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hero-section">
              <div className="hero-bg">
                <div className="personal-greeting">✨ {greeting} ✨</div>
                <h1>{couple.groom.name} <span className="ampersand">❤️</span> {couple.bride.name}</h1>
                <p>{invitationText}</p>
                <div className="wedding-date">📅 {weddingDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="wedding-time">🕒 Начало в 15:00</div>
              </div>
            </div>

            <div className="timer-section"><h3>До свадьбы осталось</h3>
              <div className="timer-grid">
                <div className="timer-card"><span>{timeLeft.days}</span><label>Дней</label></div>
                <div className="timer-card"><span>{timeLeft.hours}</span><label>Часов</label></div>
                <div className="timer-card"><span>{timeLeft.minutes}</span><label>Минут</label></div>
                <div className="timer-card"><span>{timeLeft.seconds}</span><label>Секунд</label></div>
              </div>
            </div>

            <div className="details-section"><h3>Детали торжества</h3>
              <div className="details-cards">
                <div className="detail-card"><div className="detail-icon">📍</div><h4>Место</h4><p>{couple.location}</p></div>
                <div className="detail-card"><div className="detail-icon">👔</div><h4>Дресс-код</h4><p>{couple.dressCode}</p></div>
                <div className="detail-card"><div className="detail-icon">🚗</div><h4>Парковка</h4><p>Охраняемая парковка на территории</p></div>
              </div>
            </div>

            <div className="program-section"><h3>Программа дня</h3>
              <div className="program-timeline">{program.map((item, idx) => (
                <motion.div key={idx} className="program-item" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                  <div className="program-icon">{item.icon}</div><div className="program-time">{item.time}</div>
                  <div className="program-content"><h4>{item.title}</h4><p>{item.description}</p></div>
                </motion.div>
              ))}</div>
            </div>

            <div className="map-section"><h3>Как добраться</h3>
              <div className="map-wrapper"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.123456!2d37.617734!3d55.755826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzIxLjAiTiAzN8KwMzcnMDMuOSJF!5e0!3m2!1sru!2sru!4v1" title="map" allowFullScreen loading="lazy"></iframe></div>
              <div className="qr-section"><div className="qr-code"><QRCode value={window.location.href} size={100} /><p>Ваш персональный QR-код</p></div></div>
            </div>

            <div className="rsvp-section"><h3>Подтвердите присутствие</h3>
              <form onSubmit={handleSubmit} className="rsvp-form">
                <div className="form-group"><input type="text" value={guest.fullName} disabled className="readonly-input" /></div>
                <div className="form-group"><select value={formData.attending} onChange={(e) => setFormData({...formData, attending: e.target.value})} required>
                  <option value="">Буду присутствовать?</option><option value="yes">✅ Да, с радостью приду!</option><option value="no">❌ К сожалению, не смогу</option>
                </select></div>
                <div className="form-group"><input type="number" min="1" max="4" value={formData.guests} onChange={(e) => setFormData({...formData, guests: e.target.value})} placeholder="Количество гостей" /></div>
                <div className="form-group"><textarea rows="3" placeholder="Ваши пожелания" value={formData.wishes} onChange={(e) => setFormData({...formData, wishes: e.target.value})}></textarea></div>
                <button type="submit">Отправить ответ</button>
              </form>
              {showSuccess && <div className="success-toast">❤️ Спасибо! Ждём вас на свадьбе! ❤️</div>}
            </div>

            <div className="gifts-section"><h3>Пожелания подарков</h3>
              <div className="gifts-grid">{gifts.map((gift, idx) => (<div key={idx} className="gift-item"><div className="gift-icon">{gift.icon}</div><h4>{gift.title}</h4><p>{gift.description}</p></div>))}</div>
            </div>

            <footer className="footer"><p>С нетерпением ждём встречи с вами!</p><p className="footer-names">{couple.groom.fullName} & {couple.bride.fullName}</p><div className="footer-hearts">❤️ 🤵 👰 ❤️</div></footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========== АДМИН ПАНЕЛЬ ==========
function AdminPanel({ couple, setCouple, program, setProgram, gifts, setGifts, guests, addGuest, updateGuest, deleteGuest, rsvp }) {
  const [activeTab, setActiveTab] = useState('guests');
  const [newGuest, setNewGuest] = useState({ name: '', fullName: '', gender: 'male', type: 'individual', lastName: '', partnerName: '' });
  const [newProgramItem, setNewProgramItem] = useState({ time: '', title: '', description: '', icon: '🎉' });
  const [newGift, setNewGift] = useState({ icon: '🎁', title: '', description: '' });

  const handleLogout = () => { localStorage.removeItem('adminAuth'); window.location.href = '/admin/login'; };

  const addNewGuest = () => {
    if (newGuest.name && newGuest.fullName) { addGuest(newGuest); setNewGuest({ name: '', fullName: '', gender: 'male', type: 'individual', lastName: '', partnerName: '' }); }
  };

  const addProgramItem = () => { if (newProgramItem.time && newProgramItem.title) { setProgram([...program, { ...newProgramItem, id: Date.now() }]); setNewProgramItem({ time: '', title: '', description: '', icon: '🎉' }); } };
  const updateProgramItem = (index, field, value) => { const updated = [...program]; updated[index][field] = value; setProgram(updated); };
  const deleteProgramItem = (index) => setProgram(program.filter((_, i) => i !== index));
  const addGift = () => { if (newGift.title) { setGifts([...gifts, newGift]); setNewGift({ icon: '🎁', title: '', description: '' }); } };
  const updateGift = (index, field, value) => { const updated = [...gifts]; updated[index][field] = value; setGifts(updated); };
  const deleteGift = (index) => setGifts(gifts.filter((_, i) => i !== index));
  const copyLink = (code) => { navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`); alert('Ссылка скопирована!'); };

  return (
    <div className="admin-panel">
      <div className="admin-header"><h1>👑 Админ панель</h1><button className="logout-btn" onClick={handleLogout}>Выйти</button></div>
      <div className="admin-tabs">
        <button className={activeTab === 'guests' ? 'tab active' : 'tab'} onClick={() => setActiveTab('guests')}>👥 Гости</button>
        <button className={activeTab === 'program' ? 'tab active' : 'tab'} onClick={() => setActiveTab('program')}>📋 Программа</button>
        <button className={activeTab === 'gifts' ? 'tab active' : 'tab'} onClick={() => setActiveTab('gifts')}>🎁 Подарки</button>
        <button className={activeTab === 'settings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settings')}>⚙️ Настройки</button>
        <button className={activeTab === 'stats' ? 'tab active' : 'tab'} onClick={() => setActiveTab('stats')}>📊 Статистика</button>
      </div>
      
      {activeTab === 'guests' && (
        <div className="tab-content">
          <div className="add-section"><h3>➕ Добавить гостя</h3>
            <div className="add-form">
              <select value={newGuest.type} onChange={(e) => setNewGuest({...newGuest, type: e.target.value})}>
                <option value="individual">Индивидуальный</option><option value="family">Семья</option><option value="couple">Пара</option>
              </select>
              {newGuest.type !== 'family' && <select value={newGuest.gender} onChange={(e) => setNewGuest({...newGuest, gender: e.target.value})}><option value="male">Мужской</option><option value="female">Женский</option></select>}
              <input type="text" placeholder="Имя" value={newGuest.name} onChange={(e) => setNewGuest({...newGuest, name: e.target.value})} />
              {newGuest.type === 'family' && <input type="text" placeholder="Фамилия семьи" value={newGuest.lastName} onChange={(e) => setNewGuest({...newGuest, lastName: e.target.value})} />}
              {newGuest.type === 'couple' && <input type="text" placeholder="Имя партнёра" value={newGuest.partnerName} onChange={(e) => setNewGuest({...newGuest, partnerName: e.target.value})} />}
              <input type="text" placeholder="Полное имя (для конверта)" value={newGuest.fullName} onChange={(e) => setNewGuest({...newGuest, fullName: e.target.value})} />
              <button onClick={addNewGuest}>Создать приглашение</button>
            </div>
          </div>
          <div className="guests-list"><h3>📋 Список гостей ({guests.length})</h3>
            <div className="guests-table"><table><thead><tr><th>Тип</th><th>Имя</th><th>Полное имя</th><th>Код</th><th>Статус</th><th>Ссылка</th><th></th></tr></thead>
            <tbody>{guests.map(guest => (<tr key={guest.id}>
              <td>{guest.type === 'family' ? '👨‍👩‍👧 Семья' : guest.type === 'couple' ? '💑 Пара' : guest.gender === 'male' ? '👨 Мужчина' : '👩 Женщина'}</td>
              <td><input type="text" value={guest.name} onChange={(e) => updateGuest(guest.id, { name: e.target.value })} /></td>
              <td><input type="text" value={guest.fullName} onChange={(e) => updateGuest(guest.id, { fullName: e.target.value })} /></td>
              <td><code>{guest.code}</code></td>
              <td>{rsvp[guest.code]?.attending === 'yes' ? '✅ Придет' : rsvp[guest.code]?.attending === 'no' ? '❌ Не придет' : '⏳ Ожидает'}</td>
              <td><button className="btn-copy" onClick={() => copyLink(guest.code)}>Копировать</button></td>
              <td><button className="btn-delete" onClick={() => deleteGuest(guest.id)}>🗑️</button></td>
            </tr>))}</tbody></table></div>
          </div>
        </div>
      )}
      
      {activeTab === 'program' && (
        <div className="tab-content">
          <div className="add-section"><h3>➕ Добавить событие</h3>
            <div className="add-form">
              <input type="text" placeholder="Время" value={newProgramItem.time} onChange={(e) => setNewProgramItem({...newProgramItem, time: e.target.value})} />
              <input type="text" placeholder="Название" value={newProgramItem.title} onChange={(e) => setNewProgramItem({...newProgramItem, title: e.target.value})} />
              <input type="text" placeholder="Описание" value={newProgramItem.description} onChange={(e) => setNewProgramItem({...newProgramItem, description: e.target.value})} />
              <input type="text" placeholder="Иконка" value={newProgramItem.icon} onChange={(e) => setNewProgramItem({...newProgramItem, icon: e.target.value})} style={{ width: '80px' }} />
              <button onClick={addProgramItem}>Добавить</button>
            </div>
          </div>
          <div className="program-list"><h3>📋 Программа дня</h3>
            {program.map((item, idx) => (<div key={idx} className="program-edit-item"><input type="text" value={item.time} onChange={(e) => updateProgramItem(idx, 'time', e.target.value)} /><input type="text" value={item.title} onChange={(e) => updateProgramItem(idx, 'title', e.target.value)} /><input type="text" value={item.description} onChange={(e) => updateProgramItem(idx, 'description', e.target.value)} /><input type="text" value={item.icon} onChange={(e) => updateProgramItem(idx, 'icon', e.target.value)} style={{ width: '60px' }} /><button className="btn-delete" onClick={() => deleteProgramItem(idx)}>🗑️</button></div>))}
          </div>
        </div>
      )}
      
      {activeTab === 'gifts' && (
        <div className="tab-content">
          <div className="add-section"><h3>➕ Добавить пожелание</h3>
            <div className="add-form"><input type="text" placeholder="Иконка" value={newGift.icon} onChange={(e) => setNewGift({...newGift, icon: e.target.value})} style={{ width: '80px' }} /><input type="text" placeholder="Название" value={newGift.title} onChange={(e) => setNewGift({...newGift, title: e.target.value})} /><input type="text" placeholder="Описание" value={newGift.description} onChange={(e) => setNewGift({...newGift, description: e.target.value})} /><button onClick={addGift}>Добавить</button></div>
          </div>
          <div className="gifts-list"><h3>🎁 Пожелания подарков</h3>
            {gifts.map((gift, idx) => (<div key={idx} className="gift-edit-item"><input type="text" value={gift.icon} onChange={(e) => updateGift(idx, 'icon', e.target.value)} style={{ width: '60px' }} /><input type="text" value={gift.title} onChange={(e) => updateGift(idx, 'title', e.target.value)} /><input type="text" value={gift.description} onChange={(e) => updateGift(idx, 'description', e.target.value)} /><button className="btn-delete" onClick={() => deleteGift(idx)}>🗑️</button></div>))}
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="tab-content"><div className="settings-section"><h3>⚙️ Основные настройки</h3>
          <div className="settings-form">
            <label>Имя жениха:</label><input type="text" value={couple.groom.name} onChange={(e) => setCouple({...couple, groom: {...couple.groom, name: e.target.value}})} />
            <label>Полное имя жениха:</label><input type="text" value={couple.groom.fullName} onChange={(e) => setCouple({...couple, groom: {...couple.groom, fullName: e.target.value}})} />
            <label>Имя невесты:</label><input type="text" value={couple.bride.name} onChange={(e) => setCouple({...couple, bride: {...couple.bride, name: e.target.value}})} />
            <label>Полное имя невесты:</label><input type="text" value={couple.bride.fullName} onChange={(e) => setCouple({...couple, bride: {...couple.bride, fullName: e.target.value}})} />
            <label>Дата свадьбы:</label><input type="datetime-local" value={couple.weddingDate.slice(0, 16)} onChange={(e) => setCouple({...couple, weddingDate: e.target.value})} />
            <label>Место проведения:</label><input type="text" value={couple.location} onChange={(e) => setCouple({...couple, location: e.target.value})} />
            <label>Дресс-код:</label><input type="text" value={couple.dressCode} onChange={(e) => setCouple({...couple, dressCode: e.target.value})} />
            <label>Приветственный текст:</label><textarea value={couple.welcomeText} onChange={(e) => setCouple({...couple, welcomeText: e.target.value})} rows="3" />
          </div>
        </div></div>
      )}
      
      {activeTab === 'stats' && (
        <div className="tab-content"><div className="stats-section"><h3>📊 Статистика</h3>
          <div className="stats-cards">
            <div className="stat-card-big"><div className="stat-number-big">{guests.length}</div><div className="stat-label-big">Всего гостей</div></div>
            <div className="stat-card-big success"><div className="stat-number-big">{Object.values(rsvp).filter(r => r.attending === 'yes').length}</div><div className="stat-label-big">Подтвердили</div></div>
            <div className="stat-card-big danger"><div className="stat-number-big">{Object.values(rsvp).filter(r => r.attending === 'no').length}</div><div className="stat-label-big">Отказались</div></div>
            <div className="stat-card-big"><div className="stat-number-big">{Object.values(rsvp).filter(r => !r.attending).length}</div><div className="stat-label-big">Ожидают ответа</div></div>
          </div>
          <div className="rsvp-list"><h3>📝 Ответы гостей</h3>
            <div className="guests-table"><table><thead><tr><th>Гость</th><th>Статус</th><th>Количество</th><th>Пожелания</th></tr></thead>
            <tbody>{guests.map(guest => { const response = rsvp[guest.code]; return (<tr key={guest.id}><td>{guest.fullName}</td><td>{response?.attending === 'yes' ? '✅ Придет' : response?.attending === 'no' ? '❌ Не придет' : '⏳ Ожидает'}</td><td>{response?.guests || 0}</td><td>{response?.wishes || '-'}</td></tr>); })}</tbody></table></div>
          </div>
        </div></div>
      )}
    </div>
  );
}

export default App;