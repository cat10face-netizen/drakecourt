// ==========================================
// DrakeCourt - Supabase Edition
// ==========================================

const { createClient } = supabase;

// ⚙️ НАСТРОЙКИ SUPABASE
const SUPABASE_URL = 'https://zyivvvbqvafdxhzsgjyo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MoUgkPJjmu8zpCMHFAJxDQ_tvgX1y4H';
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1519775552502894753/rG7GJ1qay-V07-xXm6HyZrmXUgJg5NekSvK13UmGBC4sSeojjqs16BwuzY_lW0OqN9Zs';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Вход
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    
    // Заявка на доступ
    document.getElementById('requestForm')?.addEventListener('submit', submitRequest);
    
    // Выход
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Тема
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Табы
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Форма добавления пользователя
    document.getElementById('addUserForm')?.addEventListener('submit', addUser);
    
    // Смена пароля
    document.getElementById('changePasswordForm')?.addEventListener('submit', changePassword);
    
    // Причина отказа (кастомная)
    document.getElementById('rej_reason')?.addEventListener('change', handleReasonChange);
}

// ==========================================
// АВТОРИЗАЦИЯ
// ==========================================

function checkAuth() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            showApp();
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    if (!login || !password) {
        alert('Заполните все поля');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('login', login)
            .eq('password', password)
            .single();
        
        if (error || !data) {
            alert('❌ Неверный логин или пароль');
            return;
        }
        
        currentUser = data;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        
    } catch (err) {
        alert('Ошибка подключения: ' + err.message);
    }
}

function showApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    
    document.getElementById('userName').textContent = currentUser.display_name;
    document.getElementById('userRole').textContent = getRoleName(currentUser.role);
    
    // Показываем панель доступа только для админов
    if (['gs_ca', 'zgs_ca'].includes(currentUser.role)) {
        document.getElementById('accessBtn').style.display = 'inline-block';
        loadUsers();
    } else {
        document.getElementById('accessBtn').style.display = 'none';
    }
}

function logout() {
    if (confirm('Выйти из системы?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        location.reload();
    }
}

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ==========================================

function switchTab(e) {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
}

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ ФОРМ ВХОДА/ЗАЯВКИ
// ==========================================

function showLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('requestForm').style.display = 'none';
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRequest() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('requestForm').style.display = 'flex';
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

// ==========================================
// ГЕНЕРАЦИЯ ДОКУМЕНТОВ
// ==========================================

function generateAcceptance(e) {
    if (e) e.preventDefault();
    
    const plaintiff = document.getElementById('acc_plaintiff').value.trim();
    const defendant = document.getElementById('acc_defendant').value.trim();
    const claim = document.getElementById('acc_claim').value.trim();
    const date = document.getElementById('acc_date').value;
    const time = document.getElementById('acc_time').value;
    const verdictDate = document.getElementById('acc_verdict_date').value;
    
    if (!plaintiff || !defendant || !claim || !date) {
        alert('Заполните обязательные поля');
        return;
    }
    
    const judgeName = currentUser.display_name;
    const signature = currentUser.signature || judgeName;
    
    const bbCode = `[CENTER]
[FONT=times new roman][IMG width="289px"]https://i.imgur.com/EaAwOzi.png[/IMG]
[B]СУД ШТАТА ДРЕЙК[/B]
4212 Конститьюшонал Авеню, Куинс,
Сан-Фиерро, Дрейк.

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]

[B][SIZE=5]О П Р Е Д Е Л Е Н И Е[/SIZE]
[FONT=times new roman]"Об начале рассмотрения искового заявления"[/FONT][/B]

Судья штата Дрейк "${judgeName}" рассматривает вопрос о принятии к производству искового заявления в соответствии с действующим законодательством.
Ожидайте в течении 6-24 часов.[/FONT][/CENTER]

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]

[RIGHT][FONT=times new roman]Судья штата Дрейк
"${judgeName}"
Дата: ${verdictDate || date}
Подпись: ${signature}[/FONT][/RIGHT]`;
    
    document.getElementById('acc_result').value = bbCode;
}

function generateConsideration(e) {
    if (e) e.preventDefault();
    
    const plaintiff = document.getElementById('con_plaintiff').value.trim();
    const defendant = document.getElementById('con_defendant').value.trim();
    const date = document.getElementById('con_date').value;
    
    if (!plaintiff || !defendant || !date) {
        alert('Заполните обязательные поля');
        return;
    }
    
    const judgeName = currentUser.display_name;
    const signature = currentUser.signature || judgeName;
    
    const bbCode = `[CENTER][FONT=times new roman][IMG width="289px"]https://i.imgur.com/EaAwOzi.png[/IMG]

[B]СУД ШТАТА ДРЕЙК[/B]
4212 Конститьюшонал Авеню, Куинс, Сан-Фиерро, Дрейк.[/FONT]

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]

[FONT=times new roman][B][SIZE=5]О П Р Е Д Е Л Е Н И Е[/SIZE]
о принятии искового заявления[/B]
Судья штата Дрейк ${judgeName} рассмотрев вопрос о принятии к производству искового заявления гражданина ${plaintiff} против ${defendant}

[B][SIZE=5]У С Т А Н О В И Л[/SIZE][/B][/FONT]
[/CENTER]
[FONT=book antiqua]1. Принять исковое обращение гражданина ${plaintiff}
2. Назначить судебное разбирательство.
3. Обязать ${defendant} предоставить объяснения и видео с боди-камеры в течение 24 часов.
4. Разъяснить ответственность по Статье 27.1 УК Штата Дрейк.
5. Направить копию сторонам.[/FONT]

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]
[CENTER][/CENTER]
[RIGHT][FONT=times new roman]Судья штата Дрейк
${judgeName}
Дата: ${date}
Подпись: ${signature}[/FONT][/RIGHT]`;
    
    document.getElementById('con_result').value = bbCode;
}

function handleReasonChange() {
    const select = document.getElementById('rej_reason');
    const customInput = document.getElementById('rej_custom_reason');
    customInput.style.display = select.value === 'custom' ? 'block' : 'none';
}

function generateRejection(e) {
    if (e) e.preventDefault();
    
    const plaintiff = document.getElementById('rej_plaintiff').value.trim();
    const reasonSelect = document.getElementById('rej_reason').value;
    const customReason = document.getElementById('rej_custom_reason').value.trim();
    const date = document.getElementById('rej_date').value;
    
    const reason = reasonSelect === 'custom' ? customReason : reasonSelect;
    
    if (!plaintiff || !reason || !date) {
        alert('Заполните обязательные поля');
        return;
    }
    
    const judgeName = currentUser.display_name;
    const signature = currentUser.signature || judgeName;
    
    const bbCode = `[CENTER][FONT=times new roman][IMG width="289px"]https://i.imgur.com/EaAwOzi.png[/IMG]

[B]СУД ШТАТА ДРЕЙК[/B]
4212 Конститьюшонал Авеню, Куинс,
Сан-Фиерро, Дрейк.[/FONT]

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]

[FONT=times new roman][B][SIZE=5]О П Р Е Д Е Л Е Н И Е[/SIZE]
"об отказе в принятии искового заявления"[/B]
Судья штата Дрейк "${judgeName}" рассмотрев вопрос о принятии к производству искового заявления в соответствии с действующим законодательством.

[B][SIZE=5]У С Т А Н О В И Л[/SIZE][/B]
[SIZE=4]Суд установил нарушение формы подачи искового заявления.
[spoiler]${reason}[/spoiler][/SIZE]

[B][SIZE=5]О П Р Е Д Е Л И Л[/SIZE][/B][/FONT][/CENTER]
[FONT=times new roman][SIZE=4]1. В принятии искового заявления гражданина "${plaintiff}" к производству Суда штата Дрейк отказать.
2. Данное определение подлежит обжалованию в течении 72 часов с момента опубликования настоящего определения[/SIZE][/FONT]

[CENTER][IMG]https://i.imgur.com/nZ15jOZ.png[/IMG][/CENTER]
[RIGHT][FONT=times new roman]Судья штата Дрейк
"${judgeName}"
Дата: ${date}
Подпись: ${signature}[/FONT][/RIGHT]`;
    
    document.getElementById('rej_result').value = bbCode;
}

function generateVerdict(e) {
    if (e) e.preventDefault();
    
    const date = document.getElementById('ver_date').value;
    
    if (!date) {
        alert('Укажите дату');
        return;
    }
    
    const establishedItems = Array.from(document.querySelectorAll('#verdict_established .verdict-item textarea'))
        .map(ta => ta.value.trim())
        .filter(v => v);
    
    const determinedItems = Array.from(document.querySelectorAll('#verdict_determined .verdict-item textarea'))
        .map(ta => ta.value.trim())
        .filter(v => v);
    
    if (establishedItems.length === 0 || determinedItems.length === 0) {
        alert('Добавьте хотя бы по одному пункту');
        return;
    }
    
    const judgeName = currentUser.display_name;
    const signature = currentUser.signature || judgeName;
    
    let bbCode = `[CENTER][FONT=times new roman][IMG width="289px"]https://i.imgur.com/EaAwOzi.png[/IMG]

[B]СУД ШТАТА ДРЕЙК[/B]
4212 Конститьюшонал Авеню, Куинс,
Сан-Фиерро, Дрейк.[/FONT]

[IMG]https://i.imgur.com/nZ15jOZ.png[/IMG]

[FONT=times new roman][B][SIZE=5]У С Т А Н О В И Л[/SIZE][/B][/FONT]
[/CENTER]
[FONT=times new roman]`;
    
    establishedItems.forEach((item, i) => {
        bbCode += `${i + 1}. ${item}\n`;
    });
    
    bbCode += `[/FONT]
[CENTER][FONT=times new roman][B][SIZE=5]О П Р Е Д Е Л И Л[/SIZE][/B][/FONT]
[/CENTER]
[FONT=times new roman]`;
    
    determinedItems.forEach((item, i) => {
        bbCode += `${i + 1}. ${item}\n`;
    });
    
    bbCode += `[/FONT]
[CENTER][IMG]https://i.imgur.com/nZ15jOZ.png[/IMG][/CENTER]
[RIGHT][FONT=times new roman]Судья штата Дрейк
${judgeName}
Дата: ${date}
Подпись: ${signature}[/FONT][/RIGHT]`;
    
    document.getElementById('ver_result').value = bbCode;
}

// ==========================================
// ПУНКТЫ ПРИГОВОРА
// ==========================================

function addVerdictItem(containerId) {
    const container = document.getElementById(containerId);
    const count = container.children.length + 1;
    
    const div = document.createElement('div');
    div.className = 'verdict-item';
    div.innerHTML = `
        <span class="item-number">${count}</span>
        <textarea rows="2" placeholder="Пункт ${count}"></textarea>
        <button type="button" class="btn-remove" onclick="removeVerdictItem(this)">×</button>
    `;
    container.appendChild(div);
}

function removeVerdictItem(btn) {
    const container = btn.parentElement.parentElement;
    if (container.children.length <= 1) {
        alert('Должен остаться хотя бы один пункт');
        return;
    }
    btn.parentElement.remove();
    renumberItems(container);
}

function renumberItems(container) {
    Array.from(container.children).forEach((item, i) => {
        item.querySelector('.item-number').textContent = i + 1;
        item.querySelector('textarea').placeholder = `Пункт ${i + 1}`;
    });
}

// ==========================================
// УТИЛИТЫ РЕЗУЛЬТАТА
// ==========================================

function copyResult(elementId) {
    const textarea = document.getElementById(elementId);
    if (!textarea.value.trim()) {
        alert('Сначала сгенерируйте документ!');
        return;
    }
    textarea.select();
    document.execCommand('copy');
    alert('✅ Скопировано в буфер обмена!');
}

function downloadResult(elementId) {
    const textarea = document.getElementById(elementId);
    if (!textarea.value.trim()) {
        alert('Сначала сгенерируйте документ!');
        return;
    }
    const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearResult(elementId) {
    document.getElementById(elementId).value = '';
}

// ==========================================
// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
// ==========================================

function showAccessPanel() {
    const panel = document.getElementById('accessPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function loadUsers() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('usersList');
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Пользователи не найдены</td></tr>';
            return;
        }
        
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.login}</td>
                <td>${getRoleName(user.role)}</td>
                <td>${user.display_name}</td>
                <td>${user.signature || '—'}</td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>${canDeleteUser(user.role) ? `<button class="btn-delete" onclick="deleteUser('${user.login}')">Удалить</button>` : '—'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить список пользователей');
    }
}

async function addUser(e) {
    e.preventDefault();
    
    const userData = {
        login: document.getElementById('newLogin').value.trim(),
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newRole').value,
        display_name: document.getElementById('newDisplayName').value.trim(),
        signature: document.getElementById('newSignature').value.trim()
    };
    
    if (!userData.login || !userData.password || !userData.role || !userData.display_name) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    if (userData.password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }
    
    try {
        const { error } = await supabaseClient.from('users').insert([userData]);
        if (error) throw error;
        
        alert('✅ Пользователь добавлен!');
        e.target.reset();
        loadUsers();
    } catch (error) {
        if (error.code === '23505') {
            alert('❌ Логин уже занят!');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function deleteUser(login) {
    if (!confirm(`Удалить пользователя ${login}?`)) return;
    
    try {
        const { error } = await supabaseClient.from('users').delete().eq('login', login);
        if (error) throw error;
        
        alert('✅ Пользователь удалён!');
        loadUsers();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function syncUsers() {
    alert('🔄 Синхронизация...');
    await loadUsers();
    alert('✅ Синхронизировано!');
}

function canDeleteUser(targetRole) {
    if (!currentUser) return false;
    if (currentUser.role === 'gs_ca') return true;
    if (currentUser.role === 'zgs_ca' && ['judge', 'watcher'].includes(targetRole)) return true;
    return false;
}

// ==========================================
// СМЕНА ПАРОЛЯ
// ==========================================

function openPasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
    document.getElementById('changePasswordForm').reset();
}

async function changePassword(e) {
    e.preventDefault();
    
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;
    
    if (current !== currentUser.password) {
        alert('❌ Неверный текущий пароль');
        return;
    }
    
    if (newPass !== confirm) {
        alert('❌ Пароли не совпадают');
        return;
    }
    
    if (newPass.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('users')
            .update({ password: newPass })
            .eq('login', currentUser.login);
        
        if (error) throw error;
        
        currentUser.password = newPass;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('✅ Пароль изменён!');
        closePasswordModal();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// ==========================================
// ЗАЯВКА НА ДОСТУП
// ==========================================

async function submitRequest(e) {
    e.preventDefault();
    
    const vk = document.getElementById('req_vk').value.trim();
    const name = document.getElementById('req_name').value.trim();
    const password = document.getElementById('req_password').value;
    const passwordConfirm = document.getElementById('req_password_confirm').value;
    const reason = document.getElementById('req_reason').value.trim();
    
    if (password !== passwordConfirm) {
        alert('❌ Пароли не совпадают!');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }
    
    if (!vk.includes('vk.com') && !vk.includes('vk.ru')) {
        alert('Укажите корректную ссылку VK');
        return;
    }
    
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `🔔 **НОВАЯ ЗАЯВКА НА ДОСТУП**\n\n` +
                    `💙 **VK:** ${vk}\n` +
                    `👤 **Имя (RP):** ${name}\n` +
                    `🔑 **Пароль:** ${password}\n` +
                    ` **Причина:** ${reason}`
            })
        });
        
        alert('✅ Заявка отправлена! Ожидайте рассмотрения.');
        e.target.reset();
        showLogin();
    } catch (error) {
        alert('❌ Ошибка отправки заявки');
    }
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

function getRoleName(role) {
    const roles = {
        'gs_ca': 'ГС ЦА',
        'zgs_ca': 'ЗГС ЦА',
        'watcher': 'Следящий ЦА',
        'judge': 'Судья'
    };
    return roles[role] || role;
}

function toggleTheme() {
    alert('🌓 Смена темы будет доступна в следующем обновлении!');
}