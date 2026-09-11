/**
 * SkillSwap Campus - Application Controller & State Engine
 * Handles Authentication, Registration, Role Switching, Quizzes, and Micro-Gigs
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'skillswap_campus_db_v2';

  // Application State
  let state = {
    currentUser: "student-1", // Active user ID or null
    users: [],
    tasks: [],
    quizzes: {},
    peerSwaps: []
  };

  // Active quiz state
  let currentQuizSession = {
    skill: null,
    currentQuestionIndex: 0,
    answers: {},
    quizData: null
  };

  // Rank weighting system
  const RANK_ORDER = {
    "Novice": 1,
    "Intermediate": 2,
    "Advanced": 3,
    "Master": 4
  };

  /* ==========================================================================
     Storage & Initialization
     ========================================================================== */

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        // Fallback check if user list is empty
        if (!state.users || state.users.length === 0) {
          resetToSeedData();
        }
      } else {
        resetToSeedData();
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using seed data", e);
      resetToSeedData();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  }

  function resetToSeedData() {
    if (window.SEED_DATA) {
      state = JSON.parse(JSON.stringify(window.SEED_DATA));
      saveState();
      showToast("Demo data loaded / reset to fresh campus state!", "info");
    }
  }

  function getCurrentUser() {
    if (!state.currentUser) return null;
    return state.users.find(u => u.id === state.currentUser) || null;
  }

  /* ==========================================================================
     UI Rendering Utilities & Modals
     ========================================================================== */

  function showToast(msg, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let icon = "💡";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  /* ==========================================================================
     Authentication & User Registration Engine
     ========================================================================== */

  function openAuthModal(defaultTab = "login") {
    switchAuthTab(defaultTab);
    openModal("modal-auth");
  }

  function switchAuthTab(tabKey) {
    const tabs = ["login", "student", "client"];
    tabs.forEach(key => {
      const btn = document.getElementById(`tab-btn-${key}`);
      const pane = document.getElementById(`pane-auth-${key}`);
      if (btn) btn.classList.toggle("active", key === tabKey);
      if (pane) pane.classList.toggle("active", key === tabKey);
    });
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.login_email.value.trim().toLowerCase();
    const password = form.login_password.value;

    const matchedUser = state.users.find(u => u.email.toLowerCase() === email);

    if (!matchedUser) {
      showToast("No campus account found with that email. Please sign up!", "warning");
      return;
    }

    if (matchedUser.password && matchedUser.password !== password) {
      showToast("Incorrect password. Please try again (default: password123).", "warning");
      return;
    }

    // Set logged in user
    state.currentUser = matchedUser.id;
    saveState();

    closeModal("modal-auth");
    form.reset();

    showToast(`Welcome back, ${matchedUser.name}!`, "success");
    syncSessionUI();
    switchTab("dashboard");
  }

  function handleStudentSignUpSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.student_name.value.trim();
    const email = form.student_email.value.trim().toLowerCase();
    const password = form.student_password.value;
    const dept = form.student_dept.value;
    const year = form.student_year.value;
    const primarySkill = form.student_skill.value;
    const wantsToLearnStr = form.student_wants_to_learn.value.trim();

    if (!name || !email || !password) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    // Check duplicate email
    if (state.users.some(u => u.email.toLowerCase() === email)) {
      showToast("An account with this campus email already exists. Please log in!", "warning");
      switchAuthTab("login");
      return;
    }

    const wantsToLearnList = wantsToLearnStr 
      ? wantsToLearnStr.split(",").map(s => s.trim()).filter(Boolean)
      : ["Figma UI Design", "Campus Projects"];

    const newStudentId = `student-${Date.now()}`;
    const newStudent = {
      id: newStudentId,
      name: name,
      email: email,
      password: password,
      role: "student",
      department: dept,
      year: year,
      avatarBg: "linear-gradient(135deg, #4f46e5, #06b6d4)",
      xp: 50, // 50 Welcome XP bonus
      campusRank: "Campus Novice",
      trustScore: 75,
      rating: 5.0,
      ratingsCount: 0,
      tasksCompleted: 0,
      skills: [
        { name: primarySkill, score: 0, rank: "Novice", verified: false, testsTaken: 0 }
      ],
      teaches: [primarySkill],
      wantsToLearn: wantsToLearnList,
      badges: ["Campus Member 2026", "Fresh Talent"]
    };

    state.users.push(newStudent);

    // Also add to Peer Swap Directory
    state.peerSwaps.push({
      id: `swap-${Date.now()}`,
      studentId: newStudentId,
      name: name,
      department: `${dept}, ${year}`,
      avatarBg: newStudent.avatarBg,
      rating: 5.0,
      reviewsCount: 0,
      teaches: [primarySkill],
      wantsToLearn: wantsToLearnList,
      bio: `Enthusiastic ${dept} student ready to collaborate on campus gigs and peer learning.`,
      availability: "Evenings & Weekends"
    });

    state.currentUser = newStudentId;
    saveState();

    form.reset();
    closeModal("modal-auth");

    showToast(`Welcome to SkillSwap, ${name}! Student ID registered.`, "success");
    syncSessionUI();
    switchTab("assessments"); // Take them directly to take verification quiz
  }

  function handleClientSignUpSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const orgName = form.client_org_name.value.trim();
    const contactName = form.client_contact_name.value.trim();
    const email = form.client_email.value.trim().toLowerCase();
    const password = form.client_password.value;
    const orgType = form.client_org_type.value;

    if (!orgName || !contactName || !email || !password) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    if (state.users.some(u => u.email.toLowerCase() === email)) {
      showToast("An account with this email already exists. Please log in!", "warning");
      switchAuthTab("login");
      return;
    }

    const newClientId = `client-${Date.now()}`;
    const newClient = {
      id: newClientId,
      name: orgName,
      contactPerson: contactName,
      email: email,
      password: password,
      role: "provider",
      department: orgName,
      organization: orgName,
      orgType: orgType,
      year: "Task Provider / Client",
      avatarBg: "linear-gradient(135deg, #059669, #0d9488)",
      tasksPosted: 0,
      tasksCompleted: 0
    };

    state.users.push(newClient);
    state.currentUser = newClientId;
    saveState();

    form.reset();
    closeModal("modal-auth");

    showToast(`Client account created for ${orgName}!`, "success");
    syncSessionUI();
    switchTab("tasks"); // Ready to post or view tasks
  }

  function quickLogin(userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) {
      showToast("User account not found", "warning");
      return;
    }

    state.currentUser = userId;
    saveState();
    closeModal("modal-auth");

    showToast(`Switched account to ${user.name} (${user.role.toUpperCase()})`, "success");
    syncSessionUI();
    switchTab("dashboard");
  }

  function handleLogout() {
    state.currentUser = null;
    saveState();
    showToast("Logged out successfully.", "info");
    syncSessionUI();
    openAuthModal("login");
  }

  /* ==========================================================================
     Header & Session UI Synchronization
     ========================================================================== */

  function toggleUserMenu() {
    const dropdown = document.getElementById("user-menu-dropdown");
    if (dropdown) dropdown.classList.toggle("active");
  }

  function closeUserMenu() {
    const dropdown = document.getElementById("user-menu-dropdown");
    if (dropdown) dropdown.classList.remove("active");
  }

  function syncSessionUI() {
    const user = getCurrentUser();
    const avatarEl = document.getElementById("header-avatar");
    const nameEl = document.getElementById("header-user-name");
    const roleEl = document.getElementById("header-user-role");

    const dropName = document.getElementById("menu-dropdown-name");
    const dropEmail = document.getElementById("menu-dropdown-email");
    const dropBadge = document.getElementById("menu-dropdown-badge");
    const dropStudentAction = document.getElementById("menu-student-action");
    const dropProviderAction = document.getElementById("menu-provider-action");

    const bannerDesc = document.getElementById("role-banner-desc");
    const bannerAction = document.getElementById("role-banner-action");

    const headerLoginBtn = document.getElementById("btn-header-login");
    const headerUserWrapper = document.getElementById("header-user-wrapper");

    // Check if logged in
    if (!user) {
      if (headerLoginBtn) headerLoginBtn.style.display = "inline-flex";
      if (headerUserWrapper) headerUserWrapper.style.display = "none";

      if (bannerDesc) {
        bannerDesc.innerHTML = `<span class="role-banner-badge" style="background:#475569;">GUEST MODE</span> You are browsing as a guest. Please log in or register to take quizzes and apply for gigs.`;
      }
      if (bannerAction) {
        bannerAction.textContent = "Log In / Sign Up 🔑";
        bannerAction.onclick = () => openAuthModal("login");
      }
      return;
    }

    // User is logged in
    if (headerLoginBtn) headerLoginBtn.style.display = "none";
    if (headerUserWrapper) headerUserWrapper.style.display = "block";

    const isStudent = user.role === "student";

    // Update Header Pill
    if (avatarEl) {
      avatarEl.textContent = user.name.charAt(0);
      avatarEl.style.background = user.avatarBg || "#4f46e5";
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      roleEl.textContent = isStudent 
        ? `${user.year} • ${user.xp || 0} XP` 
        : `${user.orgType || user.department}`;
    }

    // Update Dropdown
    if (dropName) dropName.textContent = user.name;
    if (dropEmail) dropEmail.textContent = user.email;
    if (dropBadge) {
      dropBadge.textContent = isStudent ? "STUDENT" : "CLIENT / PROVIDER";
      dropBadge.className = `badge ${isStudent ? 'badge-student' : 'badge-client'}`;
    }
    if (dropStudentAction) dropStudentAction.style.display = isStudent ? "flex" : "none";
    if (dropProviderAction) dropProviderAction.style.display = isStudent ? "none" : "flex";

    // Update Top Role Switcher Pill Active state
    document.querySelectorAll(".role-pill-btn").forEach(btn => {
      const r = btn.dataset.role;
      if (isStudent && r === "student") btn.classList.add("active");
      else if (!isStudent && r === "provider") btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Update Role Banner
    if (bannerDesc && bannerAction) {
      if (isStudent) {
        bannerDesc.innerHTML = `
          <span class="role-banner-badge">STUDENT MODE</span> 
          Logged in as <strong>${user.name}</strong> (${user.department}, ${user.year}) • Trust Score: <strong>${user.trustScore}/100</strong>
        `;
        bannerAction.textContent = "Take Skill Quiz ⚡";
        bannerAction.onclick = () => switchTab("assessments");
      } else {
        bannerDesc.innerHTML = `
          <span class="role-banner-badge" style="background:#059669;">CLIENT / TASK PROVIDER MODE</span> 
          Logged in as <strong>${user.name}</strong> (${user.orgType || user.department}) • Post tasks & manage student applicants.
        `;
        bannerAction.textContent = "+ Post New Campus Task";
        bannerAction.onclick = () => openModal("modal-post-task");
      }
    }
  }

  function switchRole(roleKey) {
    if (roleKey === "student") {
      // Find default student or first student
      const st = state.users.find(u => u.role === "student");
      if (st) state.currentUser = st.id;
    } else if (roleKey === "provider") {
      const pr = state.users.find(u => u.role === "provider");
      if (pr) state.currentUser = pr.id;
    } else if (roleKey === "admin") {
      // Admin demo mode
      showToast("Viewing Campus Admin Governance & Leaderboard", "info");
      switchTab("leaderboard");
      return;
    }

    saveState();
    syncSessionUI();
    switchTab("dashboard");
    showToast(`Switched view to ${roleKey.toUpperCase()} mode`, "info");
  }

  /* ==========================================================================
     View Switching & Navigation
     ========================================================================== */

  function switchTab(targetView) {
    // Update navigation tab buttons
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      if (btn.dataset.target === targetView) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update view sections
    document.querySelectorAll(".view-section").forEach(sec => {
      if (sec.id === `view-${targetView}`) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });

    // Trigger view renderers
    if (targetView === "dashboard") renderDashboard();
    if (targetView === "tasks") renderTasks();
    if (targetView === "assessments") renderAssessments();
    if (targetView === "swaps") renderPeerSwaps();
    if (targetView === "leaderboard") renderLeaderboard();
    if (targetView === "profile") renderProfile();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     Matching Engine Helper
     ========================================================================== */

  function isTaskRecommendedForStudent(task, student) {
    if (!student || student.role !== "student" || !student.skills) return false;
    const studentSkill = student.skills.find(s => s.name.toLowerCase() === task.requiredSkill.toLowerCase());
    if (!studentSkill || !studentSkill.verified) return false;

    const taskRankVal = RANK_ORDER[task.minRank] || 1;
    const studentRankVal = RANK_ORDER[studentSkill.rank] || 1;

    return studentRankVal >= taskRankVal;
  }

  /* ==========================================================================
     Dashboard Renderer
     ========================================================================== */

  function renderDashboard() {
    const user = getCurrentUser();
    const isStudent = user ? user.role === "student" : true;

    // Update Quick Stats
    const openTasksCount = state.tasks.filter(t => t.status === "open").length;
    const completedTasksCount = state.tasks.filter(t => t.status === "completed").length;
    const totalBounties = state.tasks.reduce((sum, t) => sum + (t.rewardAmount || 0), 0);

    const statsContainer = document.getElementById("dashboard-stats");
    if (statsContainer) {
      if (user && isStudent) {
        const topSkill = user.skills && user.skills.length > 0 ? user.skills[0] : null;
        const skillScore = topSkill ? topSkill.score : 0;
        const skillRank = topSkill ? topSkill.rank : "Unranked";
        const skillName = topSkill ? topSkill.name : "None verified";

        statsContainer.innerHTML = `
          <div class="stat-card">
            <div class="stat-icon emerald">🛡️</div>
            <div class="stat-info">
              <span class="stat-label">Trust & Skill Score</span>
              <span class="stat-value">${user.trustScore || 75}/100</span>
              <span class="stat-helper">Based on quizzes & peer tasks</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon indigo">⚡</div>
            <div class="stat-info">
              <span class="stat-label">Primary Skill Score</span>
              <span class="stat-value">${skillScore}/100</span>
              <span class="stat-helper">${skillName} (${skillRank})</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber">🏆</div>
            <div class="stat-info">
              <span class="stat-label">Campus Experience</span>
              <span class="stat-value">${user.xp || 50} XP</span>
              <span class="stat-helper">${user.campusRank || "Campus Novice"}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon sky">💼</div>
            <div class="stat-info">
              <span class="stat-label">Tasks Completed</span>
              <span class="stat-value">${user.tasksCompleted || 0}</span>
              <span class="stat-helper">Real campus work delivered</span>
            </div>
          </div>
        `;
      } else {
        // Client / Admin overview
        const clientTasksCount = user 
          ? state.tasks.filter(t => t.postedById === user.id).length 
          : openTasksCount;

        statsContainer.innerHTML = `
          <div class="stat-card">
            <div class="stat-icon emerald">📋</div>
            <div class="stat-info">
              <span class="stat-label">Active Campus Gigs</span>
              <span class="stat-value">${openTasksCount}</span>
              <span class="stat-helper">${user ? `You posted ${clientTasksCount} tasks` : 'Across departments'}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon indigo">🎓</div>
            <div class="stat-info">
              <span class="stat-label">Verified Students</span>
              <span class="stat-value">${state.users.filter(u => u.role === "student").length}</span>
              <span class="stat-helper">Ready for matched tasks</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber">💰</div>
            <div class="stat-info">
              <span class="stat-label">Total Task Rewards</span>
              <span class="stat-value">₹${totalBounties.toLocaleString()}</span>
              <span class="stat-helper">Funded by Clubs & Campus Cells</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon sky">✅</div>
            <div class="stat-info">
              <span class="stat-label">Completed Real Gigs</span>
              <span class="stat-value">${completedTasksCount}</span>
              <span class="stat-helper">Campus problems solved</span>
            </div>
          </div>
        `;
      }
    }

    // Recommended Tasks snippet
    const recommendedTasksList = document.getElementById("dashboard-recommended-tasks");
    if (recommendedTasksList) {
      let filtered = state.tasks.filter(t => t.status === "open");
      if (user && isStudent) {
        filtered.sort((a, b) => {
          const aRec = isTaskRecommendedForStudent(a, user);
          const bRec = isTaskRecommendedForStudent(b, user);
          return bRec - aRec;
        });
      }
      renderTaskCards(filtered.slice(0, 3), recommendedTasksList);
    }

    // Verified Skills preview card
    const skillListContainer = document.getElementById("dashboard-verified-skills");
    if (skillListContainer) {
      if (user && isStudent && user.skills && user.skills.length > 0) {
        skillListContainer.innerHTML = user.skills.map(s => {
          let badgeClass = s.rank === "Master" ? "badge-advanced" : (s.rank === "Advanced" ? "badge-intermediate" : "badge-beginner");
          return `
            <div style="margin-bottom: 1rem; padding: 0.85rem; background: var(--gray-50); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <strong style="font-size: 0.95rem;">${s.name}</strong>
                <span class="badge ${s.verified ? 'badge-verified' : ''}">${s.verified ? '✓ Verified' : 'Unverified'}</span>
              </div>
              <div class="quiz-score-meter">
                <div class="meter-fill" style="width: ${s.score}%"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-500); margin-top: 0.35rem;">
                <span>Score: <strong>${s.score}/100</strong></span>
                <span>Rank: <strong class="badge ${badgeClass}">${s.rank}</strong></span>
              </div>
            </div>
          `;
        }).join("");
      } else {
        skillListContainer.innerHTML = `
          <div style="text-align: center; padding: 1rem 0; color: var(--gray-500); font-size: 0.85rem;">
            No verified skills yet. Take an assessment to unlock campus gigs!
          </div>
        `;
      }
    }
  }

  /* ==========================================================================
     Tasks & Micro-Gigs Marketplace
     ========================================================================== */

  let taskFilter = {
    search: "",
    skill: "all",
    difficulty: "all"
  };

  function renderTasks() {
    const container = document.getElementById("tasks-card-container");
    if (!container) return;

    let tasks = state.tasks.filter(t => {
      // Search query
      if (taskFilter.search) {
        const q = taskFilter.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesDept = t.department.toLowerCase().includes(q);
        const matchesSkill = t.requiredSkill.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesDept && !matchesSkill) return false;
      }
      // Skill filter
      if (taskFilter.skill !== "all" && t.requiredSkill.toLowerCase() !== taskFilter.skill.toLowerCase()) {
        return false;
      }
      // Difficulty filter
      if (taskFilter.difficulty !== "all" && t.difficulty.toLowerCase() !== taskFilter.difficulty.toLowerCase()) {
        return false;
      }
      return true;
    });

    renderTaskCards(tasks, container);
  }

  function renderTaskCards(tasks, container) {
    if (tasks.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--gray-800);">No matching campus tasks found</h3>
          <p style="color: var(--gray-500); font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your skill search filters or post a new campus task.</p>
        </div>
      `;
      return;
    }

    const currentUser = getCurrentUser();
    const isStudent = currentUser ? currentUser.role === "student" : false;
    const isProvider = currentUser ? currentUser.role === "provider" : false;

    container.innerHTML = tasks.map(task => {
      const isRecommended = isStudent && isTaskRecommendedForStudent(task, currentUser);
      const studentSkill = isStudent ? currentUser.skills?.find(s => s.name.toLowerCase() === task.requiredSkill.toLowerCase()) : null;
      const hasApplied = task.applicants?.some(a => currentUser && a.studentId === currentUser.id);
      const isTaskPoster = currentUser && task.postedById === currentUser.id;

      // Determine Action Button
      let actionButtonHtml = "";

      if (task.status === "completed") {
        actionButtonHtml = `
          <button class="btn btn-outline btn-sm" onclick="window.viewTaskDetails('${task.id}')">
            View Review ⭐
          </button>
        `;
      } else if (isProvider || isTaskPoster) {
        actionButtonHtml = `
          <button class="btn btn-primary btn-sm" onclick="window.manageTaskApplicants('${task.id}')">
            Manage (${task.applicants ? task.applicants.length : 0} Applicants)
          </button>
        `;
      } else if (!currentUser) {
        actionButtonHtml = `
          <button class="btn btn-outline btn-sm" onclick="window.openAuthModal('login')">
            Log In to Apply
          </button>
        `;
      } else if (hasApplied) {
        actionButtonHtml = `
          <button class="btn btn-secondary btn-sm" disabled>
            ✓ Applied
          </button>
        `;
      } else if (isRecommended) {
        actionButtonHtml = `
          <button class="btn btn-primary btn-sm" onclick="window.openApplyModal('${task.id}')">
            Apply Now ⚡
          </button>
        `;
      } else if (studentSkill && !studentSkill.verified) {
        actionButtonHtml = `
          <button class="btn btn-outline btn-sm" onclick="window.startAssessment('${task.requiredSkill}')" style="border-color: var(--primary); color: var(--primary);">
            Verify Skill ✍️
          </button>
        `;
      } else {
        actionButtonHtml = `
          <button class="btn btn-outline btn-sm" onclick="window.openApplyModal('${task.id}')">
            Apply
          </button>
        `;
      }

      let diffBadgeClass = "badge-beginner";
      if (task.difficulty === "Intermediate") diffBadgeClass = "badge-intermediate";
      if (task.difficulty === "Advanced") diffBadgeClass = "badge-advanced";

      let statusBadgeClass = "badge-open";
      if (task.status === "in_progress") statusBadgeClass = "badge-in_progress";
      if (task.status === "completed") statusBadgeClass = "badge-completed";

      return `
        <article class="task-card ${isRecommended ? 'recommended' : ''}">
          ${isRecommended ? '<div class="recommended-badge">⚡ Match for You</div>' : ''}
          
          <div>
            <div class="task-header">
              <div class="task-dept-tag">
                <span>🏛️ ${task.department}</span>
              </div>
              <span class="badge ${statusBadgeClass}">${task.status.replace('_', ' ').toUpperCase()}</span>
            </div>

            <h3 class="task-title">${task.title}</h3>
            <p class="task-desc">${task.description}</p>

            <div class="task-requirements">
              <div class="req-item">
                <span class="req-label">Required Skill:</span>
                <span class="req-value">
                  <span class="skill-tag">${task.requiredSkill}</span>
                </span>
              </div>
              <div class="req-item">
                <span class="req-label">Minimum Rank:</span>
                <span class="req-value">
                  <span class="badge ${diffBadgeClass}">${task.minRank}</span>
                </span>
              </div>
              <div class="req-item">
                <span class="req-label">Estimated Time:</span>
                <span class="req-value">⏱️ ${task.estTime}</span>
              </div>
            </div>
          </div>

          <div class="task-meta-bar">
            <div class="task-reward">
              <span class="reward-amount">₹${task.rewardAmount}</span>
              <span class="reward-xp">+${task.xpReward} XP & Trust Score</span>
            </div>
            <div class="task-footer-actions">
              ${actionButtonHtml}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  /* ==========================================================================
     Skill Assessment & Verification Hub
     ========================================================================== */

  function renderAssessments() {
    const container = document.getElementById("assessments-grid");
    if (!container) return;

    const user = getCurrentUser();
    const skillsList = ["Python", "Excel", "HTML/CSS", "Graphic Design"];

    container.innerHTML = skillsList.map(skillName => {
      const quiz = state.quizzes[skillName];
      const userSkill = (user && user.skills) ? user.skills.find(s => s.name === skillName) : null;

      const score = userSkill ? userSkill.score : 0;
      const rank = userSkill ? userSkill.rank : "Unranked";
      const isVerified = userSkill ? userSkill.verified : false;

      let icon = "💻";
      if (skillName === "Excel") icon = "📊";
      if (skillName === "HTML/CSS") icon = "🌐";
      if (skillName === "Graphic Design") icon = "🎨";

      let rankClass = "badge-beginner";
      if (rank === "Intermediate") rankClass = "badge-intermediate";
      if (rank === "Advanced" || rank === "Master") rankClass = "badge-advanced";

      return `
        <div class="quiz-card">
          <div>
            <div class="quiz-top">
              <div class="quiz-icon-badge">${icon}</div>
              <span class="badge ${isVerified ? 'badge-verified' : ''}">
                ${isVerified ? '✓ Verified Skill' : 'Unverified'}
              </span>
            </div>

            <h3 class="quiz-title">${skillName}</h3>
            <p class="quiz-desc">${quiz ? quiz.description : 'Standard campus verification test'}</p>

            <div class="quiz-score-meter">
              <div class="meter-fill" style="width: ${score}%"></div>
            </div>

            <div class="score-stats">
              <span>Skill Score: <strong>${score}/100</strong></span>
              <span>Rank: <span class="badge ${rankClass}">${rank}</span></span>
            </div>
          </div>

          <div>
            <button class="btn btn-primary btn-block" onclick="window.startAssessment('${skillName}')">
              ${isVerified ? 'Retake to Boost Rank 🚀' : 'Take Verification Assessment ✍️'}
            </button>
            <div style="font-size: 0.72rem; color: var(--gray-500); text-align: center; margin-top: 0.5rem;">
              4 Questions • ~5 min • Instant Score
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function startAssessment(skillName) {
    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in or register as a student to take assessments", "warning");
      openAuthModal("student");
      return;
    }

    if (user.role !== "student") {
      showToast("You are logged in as a Client/Provider. Switch to a Student account to take skill quizzes!", "info");
      return;
    }

    const quiz = state.quizzes[skillName];
    if (!quiz) {
      showToast(`No assessment questions found for ${skillName}`, "warning");
      return;
    }

    currentQuizSession = {
      skill: skillName,
      currentQuestionIndex: 0,
      answers: {},
      quizData: quiz
    };

    renderQuizQuestion();
    openModal("modal-quiz");
  }

  function renderQuizQuestion() {
    const qIndex = currentQuizSession.currentQuestionIndex;
    const questions = currentQuizSession.quizData.questions;
    const q = questions[qIndex];

    const titleEl = document.getElementById("quiz-modal-title");
    const progressEl = document.getElementById("quiz-step-text");
    const questionTextEl = document.getElementById("quiz-question-text");
    const codeContainer = document.getElementById("quiz-code-container");
    const optionsContainer = document.getElementById("quiz-options-container");
    const nextBtn = document.getElementById("quiz-next-btn");
    const finishBtn = document.getElementById("quiz-finish-btn");

    if (titleEl) titleEl.textContent = `${currentQuizSession.skill} Verification Quiz`;
    if (progressEl) progressEl.textContent = `Question ${qIndex + 1} of ${questions.length}`;
    if (questionTextEl) questionTextEl.textContent = q.question;

    if (codeContainer) {
      if (q.code) {
        codeContainer.style.display = "block";
        codeContainer.textContent = q.code;
      } else {
        codeContainer.style.display = "none";
      }
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = q.options.map((opt, idx) => {
        const isSelected = currentQuizSession.answers[qIndex] === idx;
        return `
          <label class="quiz-option-label ${isSelected ? 'selected' : ''}" onclick="window.selectQuizOption(${idx})">
            <input type="radio" name="quiz_opt" value="${idx}" ${isSelected ? 'checked' : ''} style="accent-color: var(--primary);">
            <span>${opt}</span>
          </label>
        `;
      }).join("");
    }

    const isLast = qIndex === questions.length - 1;
    if (nextBtn) nextBtn.style.display = isLast ? "none" : "inline-flex";
    if (finishBtn) finishBtn.style.display = isLast ? "inline-flex" : "none";
  }

  function selectQuizOption(optionIndex) {
    currentQuizSession.answers[currentQuizSession.currentQuestionIndex] = optionIndex;
    renderQuizQuestion();
  }

  function nextQuizQuestion() {
    if (currentQuizSession.answers[currentQuizSession.currentQuestionIndex] === undefined) {
      showToast("Please choose an answer to proceed", "warning");
      return;
    }
    currentQuizSession.currentQuestionIndex++;
    renderQuizQuestion();
  }

  function submitQuiz() {
    if (currentQuizSession.answers[currentQuizSession.currentQuestionIndex] === undefined) {
      showToast("Please choose an answer before submitting", "warning");
      return;
    }

    const questions = currentQuizSession.quizData.questions;
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (currentQuizSession.answers[idx] === q.correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);

    // Determine Rank
    let rank = "Novice";
    let earnedXp = 40;
    if (calculatedScore >= 90) {
      rank = "Master";
      earnedXp = 150;
    } else if (calculatedScore >= 75) {
      rank = "Advanced";
      earnedXp = 100;
    } else if (calculatedScore >= 50) {
      rank = "Intermediate";
      earnedXp = 60;
    }

    // Update Student record
    const user = getCurrentUser();
    if (!user) return;
    if (!user.skills) user.skills = [];

    let existingSkill = user.skills.find(s => s.name.toLowerCase() === currentQuizSession.skill.toLowerCase());
    if (existingSkill) {
      existingSkill.score = calculatedScore;
      existingSkill.rank = rank;
      existingSkill.verified = true;
      existingSkill.testsTaken = (existingSkill.testsTaken || 0) + 1;
    } else {
      user.skills.push({
        name: currentQuizSession.skill,
        score: calculatedScore,
        rank: rank,
        verified: true,
        testsTaken: 1
      });
    }

    // Award XP and bump trust score
    user.xp = (user.xp || 0) + earnedXp;
    user.trustScore = Math.min(99, (user.trustScore || 75) + 3);

    saveState();

    // Show Result Dialog
    closeModal("modal-quiz");
    showQuizResultModal(currentQuizSession.skill, calculatedScore, rank, correctCount, questions.length, earnedXp);
  }

  function showQuizResultModal(skill, score, rank, correct, total, xp) {
    const body = document.getElementById("quiz-result-body");
    if (!body) return;

    body.innerHTML = `
      <div class="quiz-result-card">
        <div class="result-score-circle">
          <span class="result-score-val">${score}</span>
          <span class="result-score-denom">SCORE / 100</span>
        </div>
        <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--gray-900);">Skill Verified: ${skill}</h3>
        <p style="color: var(--gray-600); margin: 0.5rem 0 1.25rem;">
          You answered <strong>${correct} of ${total}</strong> questions correctly. Your verified campus rank is updated to:
        </p>

        <div style="margin-bottom: 1.5rem;">
          <span class="badge badge-advanced" style="font-size: 1rem; padding: 0.4rem 1.2rem;">
            🏆 ${rank} Rank
          </span>
        </div>

        <div style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
            <span>Experience Earned:</span>
            <strong style="color: var(--primary);">+${xp} XP</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span>Campus Trust Score:</span>
            <strong style="color: var(--success);">Updated to ${getCurrentUser().trustScore}/100</strong>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-outline" onclick="window.closeModal('modal-quiz-result')">Close</button>
          <button class="btn btn-primary" onclick="window.closeModal('modal-quiz-result'); window.switchTab('tasks');">
            View Matching Tasks ⚡
          </button>
        </div>
      </div>
    `;

    openModal("modal-quiz-result");
    renderDashboard();
    syncSessionUI();
  }

  /* ==========================================================================
     Task Lifecycle: Post, Apply, Manage, Rate
     ========================================================================== */

  function handlePostTaskSubmit(e) {
    e.preventDefault();
    const user = getCurrentUser();

    if (!user) {
      showToast("Please log in or register as a client/provider to post tasks", "warning");
      openAuthModal("client");
      return;
    }

    if (user.role === "student") {
      showToast("You are logged in as a Student. Switch to or register a Client account to post tasks!", "info");
      openAuthModal("client");
      return;
    }

    const form = e.target;
    const title = form.task_title.value.trim();
    const desc = form.task_desc.value.trim();
    const skill = form.task_skill.value;
    const rank = form.task_min_rank.value;
    const diff = form.task_difficulty.value;
    const time = form.task_time.value.trim();
    const reward = parseInt(form.task_reward.value, 10) || 200;
    const dept = form.task_dept.value.trim() || user.department || "Campus Organization";

    if (!title || !desc || !time) {
      showToast("Please fill out all required task fields", "warning");
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title,
      description: desc,
      department: dept,
      requiredSkill: skill,
      minRank: rank,
      difficulty: diff,
      estTime: time,
      rewardAmount: reward,
      rewardType: `₹ Cash + Certificate`,
      xpReward: Math.round(reward / 4),
      postedBy: user.name,
      postedById: user.id,
      postedAt: "Just now",
      status: "open",
      assignedTo: null,
      applicants: []
    };

    state.tasks.unshift(newTask);

    // Update user stats
    user.tasksPosted = (user.tasksPosted || 0) + 1;
    saveState();

    form.reset();
    closeModal("modal-post-task");
    showToast(`Campus Task "${title.substring(0, 30)}..." published!`, "success");

    renderTasks();
    renderDashboard();
  }

  function openApplyModal(taskId) {
    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in or register as a student to apply for tasks", "warning");
      openAuthModal("login");
      return;
    }

    if (user.role !== "student") {
      showToast("Only Students can apply for tasks. Switch to a student account!", "info");
      return;
    }

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const studentSkill = user.skills?.find(s => s.name.toLowerCase() === task.requiredSkill.toLowerCase()) || {
      score: 0,
      rank: "Unranked",
      verified: false
    };

    const container = document.getElementById("apply-modal-content");
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom: 1.25rem; background: var(--gray-50); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;">
        <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--gray-900);">${task.title}</h4>
        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--gray-600); margin-top: 0.4rem;">
          <span>Reward: <strong style="color: var(--gray-900);">₹${task.rewardAmount}</strong></span>
          <span>Required: <strong>${task.requiredSkill} (${task.minRank})</strong></span>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <label class="form-label">Your Verification Credentials</label>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid ${studentSkill.verified ? '#86efac' : 'var(--border-color)'}; background: ${studentSkill.verified ? '#f0fdf4' : 'white'};">
          <div>
            <strong>${task.requiredSkill}</strong>: 
            <span class="badge ${studentSkill.verified ? 'badge-verified' : ''}">${studentSkill.verified ? '✓ Verified (' + studentSkill.score + '/100)' : 'Not Yet Verified'}</span>
          </div>
          <div>
            Your Rank: <strong>${studentSkill.rank}</strong>
          </div>
        </div>
      </div>

      <form id="form-apply-task" onsubmit="window.submitTaskApplication(event, '${task.id}')">
        <div class="form-group">
          <label class="form-label">Why are you a good fit for this campus task?</label>
          <textarea class="form-textarea" name="proposal" rows="3" placeholder="Mention relevant experience, past coursework, or turnaround time..." required>I have verified skills in ${task.requiredSkill} and can complete this with clean documentation within the deadline.</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal('modal-apply')">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Application 🚀</button>
        </div>
      </form>
    `;

    openModal("modal-apply");
  }

  function submitTaskApplication(e, taskId) {
    e.preventDefault();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const user = getCurrentUser();
    const proposal = e.target.proposal.value.trim();
    const studentSkill = user.skills?.find(s => s.name.toLowerCase() === task.requiredSkill.toLowerCase()) || {
      score: 50,
      rank: "Novice"
    };

    if (!task.applicants) task.applicants = [];
    task.applicants.push({
      studentId: user.id,
      name: user.name,
      skillScore: studentSkill.score || 50,
      skillRank: studentSkill.rank || "Novice",
      proposal: proposal,
      appliedAt: "Just now"
    });

    saveState();
    closeModal("modal-apply");
    showToast("Application submitted successfully to task provider!", "success");

    renderTasks();
  }

  function manageTaskApplicants(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const container = document.getElementById("manage-modal-content");
    if (!container) return;

    const applicants = task.applicants || [];

    let applicantsListHtml = "";
    if (applicants.length === 0) {
      applicantsListHtml = `
        <div style="text-align: center; padding: 2rem 0; color: var(--gray-500);">
          No student applicants yet for this task.
        </div>
      `;
    } else {
      applicantsListHtml = applicants.map(app => {
        const isAssigned = task.assignedTo === app.studentId;
        return `
          <div class="applicant-card">
            <div class="applicant-info">
              <div class="user-avatar" style="background: linear-gradient(135deg, #4f46e5, #06b6d4);">
                ${app.name.charAt(0)}
              </div>
              <div>
                <strong style="font-size: 0.9rem; color: var(--gray-900);">${app.name}</strong>
                <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.15rem;">
                  Score: <strong style="color: var(--success);">${app.skillScore}/100</strong> • Rank: <span class="badge badge-intermediate">${app.skillRank}</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--gray-700); margin-top: 0.4rem; font-style: italic;">
                  "${app.proposal}"
                </p>
              </div>
            </div>
            <div>
              ${isAssigned
                ? '<span class="badge badge-in_progress">Assigned</span>'
                : `<button class="btn btn-success btn-sm" onclick="window.assignStudentToTask('${task.id}', '${app.studentId}')">Accept Student ✓</button>`
              }
            </div>
          </div>
        `;
      }).join("");
    }

    let completionSection = "";
    if (task.status === "in_progress") {
      completionSection = `
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: var(--gray-800);">Task is currently In Progress</strong>
            <p style="font-size: 0.78rem; color: var(--gray-500);">Once the student delivers the work, mark completed and submit a review.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.openRatingModal('${task.id}')">
            Mark Completed & Rate ⭐
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--gray-900);">${task.title}</h4>
        <p style="font-size: 0.82rem; color: var(--gray-500);">${task.department} • Reward: ₹${task.rewardAmount}</p>
      </div>
      <div>
        <h5 style="font-size: 0.85rem; text-transform: uppercase; color: var(--gray-500); margin-bottom: 0.75rem;">Applicants (${applicants.length})</h5>
        ${applicantsListHtml}
      </div>
      ${completionSection}
    `;

    openModal("modal-manage-task");
  }

  function assignStudentToTask(taskId, studentId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = "in_progress";
    task.assignedTo = studentId;

    saveState();
    showToast("Student accepted! Task status set to In Progress.", "success");
    manageTaskApplicants(taskId);
    renderTasks();
  }

  function openRatingModal(taskId) {
    closeModal("modal-manage-task");
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const assignedStudent = state.users.find(u => u.id === task.assignedTo) || { name: "Assigned Student" };
    const container = document.getElementById("rating-modal-content");
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
        <h4 style="font-size: 1.2rem; font-weight: 800;">Complete Task & Rate Student</h4>
        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.25rem;">
          Rate <strong>${assignedStudent.name}</strong> for completing <em>"${task.title}"</em>
        </p>
      </div>

      <form id="form-rate-task" onsubmit="window.submitTaskRating(event, '${task.id}')">
        <div class="form-group" style="text-align: center;">
          <label class="form-label">Student Performance Rating</label>
          <div class="star-rating" id="star-rating-box" style="justify-content: center; margin: 0.5rem 0;">
            <span class="star active" data-val="1" onclick="window.setStarRating(1)">★</span>
            <span class="star active" data-val="2" onclick="window.setStarRating(2)">★</span>
            <span class="star active" data-val="3" onclick="window.setStarRating(3)">★</span>
            <span class="star active" data-val="4" onclick="window.setStarRating(4)">★</span>
            <span class="star active" data-val="5" onclick="window.setStarRating(5)">★</span>
          </div>
          <input type="hidden" name="rating_value" id="selected-rating-val" value="5">
        </div>

        <div class="form-group">
          <label class="form-label">Review / Feedback</label>
          <textarea class="form-textarea" name="review_comment" rows="3" placeholder="How was the quality of work, speed, and communication?" required>Delivered clean, professional work right on schedule. Highly recommended!</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal('modal-rate')">Cancel</button>
          <button type="submit" class="btn btn-success">Finalize & Award ₹${task.rewardAmount} 💰</button>
        </div>
      </form>
    `;

    openModal("modal-rate");
  }

  function setStarRating(val) {
    const stars = document.querySelectorAll("#star-rating-box .star");
    const hidden = document.getElementById("selected-rating-val");
    if (hidden) hidden.value = val;

    stars.forEach(s => {
      const sVal = parseInt(s.dataset.val, 10);
      s.classList.toggle("active", sVal <= val);
    });
  }

  function submitTaskRating(e, taskId) {
    e.preventDefault();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const ratingVal = parseInt(e.target.rating_value.value, 10) || 5;
    const comment = e.target.review_comment.value.trim();

    task.status = "completed";
    task.review = {
      rating: ratingVal,
      comment: comment,
      by: task.postedBy,
      givenAt: "Just now"
    };

    // Bump student XP, trust score, and task count
    const student = state.users.find(u => u.id === task.assignedTo);
    if (student) {
      student.tasksCompleted = (student.tasksCompleted || 0) + 1;
      student.xp = (student.xp || 0) + (task.xpReward || 100);
      student.trustScore = Math.min(99, (student.trustScore || 75) + 2);
    }

    saveState();
    closeModal("modal-rate");
    showToast(`Task completed! Student received rating and +${task.xpReward} XP.`, "success");

    renderTasks();
    renderDashboard();
  }

  function viewTaskDetails(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const container = document.getElementById("generic-modal-content");
    const titleEl = document.getElementById("generic-modal-title");
    if (!container || !titleEl) return;

    titleEl.textContent = "Completed Campus Micro-Gig";
    container.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--gray-900);">${task.title}</h4>
        <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.25rem;">${task.description}</p>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: #065f46;">Verified Provider Feedback</strong>
          <span style="color: #b45309; font-weight: 800;">${'★'.repeat(task.review ? task.review.rating : 5)} (${task.review ? task.review.rating : 5}/5)</span>
        </div>
        <p style="font-style: italic; color: #047857; font-size: 0.9rem;">
          "${task.review ? task.review.comment : 'Great delivery!'}"
        </p>
        <div style="font-size: 0.75rem; color: #065f46; margin-top: 0.5rem;">
          By: <strong>${task.review ? task.review.by : task.postedBy}</strong>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button class="btn btn-primary" onclick="window.closeModal('modal-generic')">Close</button>
      </div>
    `;

    openModal("modal-generic");
  }

  /* ==========================================================================
     Peer SkillSwap Directory
     ========================================================================== */

  function renderPeerSwaps() {
    const container = document.getElementById("peer-cards-container");
    if (!container) return;

    container.innerHTML = state.peerSwaps.map(peer => {
      return `
        <div class="peer-card">
          <div class="peer-profile-header">
            <div class="peer-avatar-lg" style="background: ${peer.avatarBg}">
              ${peer.name.charAt(0)}
            </div>
            <div class="peer-header-info">
              <h4 class="peer-name">${peer.name}</h4>
              <div class="peer-meta">${peer.department}</div>
              <div class="peer-rating">★ ${peer.rating} (${peer.reviewsCount} peer ratings)</div>
            </div>
          </div>

          <p style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: 1rem; line-height: 1.4;">
            "${peer.bio}"
          </p>

          <div class="swap-skill-box">
            <div class="swap-row">
              <span class="swap-label">Can Teach / Mentor:</span>
              <div class="skill-tags">
                ${peer.teaches.map(s => `<span class="skill-tag teach">✓ ${s}</span>`).join("")}
              </div>
            </div>
            <div class="swap-row" style="margin-top: 0.5rem;">
              <span class="swap-label">Wants to Learn:</span>
              <div class="skill-tags">
                ${peer.wantsToLearn.map(s => `<span class="skill-tag learn">🎯 ${s}</span>`).join("")}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem;">
            <span style="font-size: 0.72rem; color: var(--gray-500);">⏱️ ${peer.availability}</span>
            <button class="btn btn-primary btn-sm" onclick="window.openSwapModal('${peer.id}')">
              Request Skill Swap 🤝
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  function openSwapModal(peerId) {
    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in or sign up to request a skill swap", "warning");
      openAuthModal("login");
      return;
    }

    const peer = state.peerSwaps.find(p => p.id === peerId);
    if (!peer) return;

    const container = document.getElementById("swap-modal-content");
    if (!container) return;

    const userSkills = (user.skills && user.skills.length > 0) 
      ? user.skills.map(s => s.name) 
      : ["Python", "Excel", "General Tutoring"];

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="peer-avatar-lg" style="background: ${peer.avatarBg}; width: 44px; height: 44px; font-size: 1rem;">
          ${peer.name.charAt(0)}
        </div>
        <div>
          <h4 style="font-weight: 800; font-size: 1.05rem;">Propose Skill Swap with ${peer.name}</h4>
          <span style="font-size: 0.75rem; color: var(--gray-500);">${peer.department}</span>
        </div>
      </div>

      <form id="form-peer-swap" onsubmit="window.submitSwapProposal(event, '${peer.name}')">
        <div class="form-group">
          <label class="form-label">What skill can you offer to teach?</label>
          <select class="form-select" name="offered_skill">
            ${userSkills.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">What skill do you want ${peer.name} to teach you?</label>
          <select class="form-select" name="requested_skill">
            ${peer.teaches.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Proposal Message & Preferred Timing</label>
          <textarea class="form-textarea" rows="3" required placeholder="E.g. Hey! I saw you know Figma. Let's do a 45-min swap this Saturday at the campus library or on Meet.">Hey ${peer.name}! I'd love to swap skills 1-on-1. Let me know when you're free this week.</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal('modal-swap')">Cancel</button>
          <button type="submit" class="btn btn-primary">Send Swap Proposal 🤝</button>
        </div>
      </form>
    `;

    openModal("modal-swap");
  }

  function submitSwapProposal(e, peerName) {
    e.preventDefault();
    closeModal("modal-swap");
    showToast(`Skill Swap proposal sent to ${peerName}! Notification sent to campus email.`, "success");
  }

  /* ==========================================================================
     Profile & Reputation Hub (Dynamic for Student vs Client)
     ========================================================================== */

  function renderProfile() {
    const user = getCurrentUser();
    const container = document.getElementById("profile-view-content");
    if (!container) return;

    if (!user) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">👤</div>
          <h3 style="font-size: 1.3rem; font-weight: 800;">No Account Logged In</h3>
          <p style="color: var(--gray-500); margin: 0.5rem 0 1.5rem;">Log in or create a student / client profile to track your campus reputation.</p>
          <button class="btn btn-primary btn-lg" onclick="window.openAuthModal('login')">Log In / Sign Up ➔</button>
        </div>
      `;
      return;
    }

    const isStudent = user.role === "student";

    if (isStudent) {
      // Student Profile
      container.innerHTML = `
        <div class="profile-hero">
          <div class="profile-main-info">
            <div class="profile-avatar-xl" style="background: ${user.avatarBg || '#4f46e5'};">
              ${user.name.charAt(0)}
            </div>
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--gray-900);">${user.name}</h2>
              <p style="color: var(--gray-600); font-size: 0.9rem;">${user.department} • ${user.year || 'Student'}</p>
              <div style="font-size: 0.78rem; color: var(--gray-500); margin-top: 0.2rem;">📧 ${user.email}</div>
              <div class="profile-badge-strip">
                ${(user.badges || []).map(b => `<span class="badge badge-verified">🏅 ${b}</span>`).join("")}
              </div>
            </div>
          </div>

          <div class="trust-score-card">
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">Campus Trust Score</span>
            <div class="trust-val">${user.trustScore || 75}/100</div>
            <span style="font-size: 0.75rem; opacity: 0.9;">Rank: ${user.campusRank || 'Campus Novice'}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">Verified Skill Portfolio</h3>
            ${(user.skills || []).map(s => `
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                  <strong>${s.name}</strong>
                  <span>Score: <strong>${s.score}/100</strong> (${s.rank})</span>
                </div>
                <div class="quiz-score-meter">
                  <div class="meter-fill" style="width: ${s.score}%"></div>
                </div>
              </div>
            `).join("")}
            <button class="btn btn-outline btn-block btn-sm" onclick="window.switchTab('assessments')" style="margin-top: 1rem;">
              Take More Assessments ✍️
            </button>
          </div>

          <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">Campus Micro-Gig History</h3>
            <div style="display: flex; gap: 1rem; margin-bottom: 1.25rem;">
              <div style="flex: 1; background: var(--gray-50); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 1.4rem; font-weight: 800;">${user.tasksCompleted || 0}</div>
                <div style="font-size: 0.72rem; color: var(--gray-500);">Completed Tasks</div>
              </div>
              <div style="flex: 1; background: var(--gray-50); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 1.4rem; font-weight: 800; color: #b45309;">★ ${user.rating || 5.0}</div>
                <div style="font-size: 0.72rem; color: var(--gray-500);">${user.ratingsCount || 0} Reviews</div>
              </div>
              <div style="flex: 1; background: var(--gray-50); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${user.xp || 50}</div>
                <div style="font-size: 0.72rem; color: var(--gray-500);">Earned XP</div>
              </div>
            </div>

            <div style="font-size: 0.82rem; color: var(--gray-600);">
              <strong>Wants to Learn:</strong>
              <div class="skill-tags" style="margin-top: 0.4rem;">
                ${(user.wantsToLearn || []).map(s => `<span class="skill-tag learn">🎯 ${s}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Client / Task Provider Profile
      const myTasks = state.tasks.filter(t => t.postedById === user.id);

      container.innerHTML = `
        <div class="profile-hero">
          <div class="profile-main-info">
            <div class="profile-avatar-xl" style="background: ${user.avatarBg || '#059669'};">
              ${user.name.charAt(0)}
            </div>
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--gray-900);">${user.name}</h2>
              <p style="color: var(--gray-600); font-size: 0.9rem;">${user.orgType || 'Campus Organization'} • Contact: ${user.contactPerson || user.name}</p>
              <div style="font-size: 0.78rem; color: var(--gray-500); margin-top: 0.2rem;">📧 ${user.email}</div>
              <div class="profile-badge-strip">
                <span class="badge badge-client">🏛️ Verified Task Provider</span>
                <span class="badge badge-verified">✓ Campus Registered</span>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" onclick="window.openModal('modal-post-task')">
            + Post New Campus Task
          </button>
        </div>

        <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">Gigs Posted by ${user.name} (${myTasks.length})</h3>
          ${myTasks.length === 0 ? `
            <div style="text-align: center; padding: 2rem 0; color: var(--gray-500);">
              You haven't posted any campus gigs yet. Click "+ Post New Campus Task" above!
            </div>
          ` : `
            <div class="tasks-grid" style="grid-template-columns: 1fr;">
              ${myTasks.map(t => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--gray-50);">
                  <div>
                    <strong style="font-size: 1rem; color: var(--gray-900);">${t.title}</strong>
                    <div style="font-size: 0.78rem; color: var(--gray-500); margin-top: 0.2rem;">
                      Skill: <strong>${t.requiredSkill} (${t.minRank})</strong> • Reward: <strong>₹${t.rewardAmount}</strong> • Status: <span class="badge badge-open">${t.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <button class="btn btn-primary btn-sm" onclick="window.manageTaskApplicants('${t.id}')">
                      Manage Applicants (${t.applicants ? t.applicants.length : 0})
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      `;
    }
  }

  /* ==========================================================================
     Leaderboard Renderer
     ========================================================================== */

  function renderLeaderboard() {
    const tableBody = document.getElementById("leaderboard-table-body");
    if (!tableBody) return;

    // Filter students and sort by XP
    const students = state.users.filter(u => u.role === "student").slice();
    students.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    tableBody.innerHTML = students.map((s, idx) => {
      let rankClass = "rank-other";
      if (idx === 0) rankClass = "rank-1";
      if (idx === 1) rankClass = "rank-2";
      if (idx === 2) rankClass = "rank-3";

      const topSkill = s.skills && s.skills.length > 0 ? s.skills[0] : { name: "General", score: 80, rank: "Intermediate" };

      return `
        <tr>
          <td>
            <div class="rank-badge ${rankClass}">#${idx + 1}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="user-avatar" style="background: ${s.avatarBg || '#4f46e5'};">
                ${s.name.charAt(0)}
              </div>
              <div>
                <strong>${s.name}</strong>
                <div style="font-size: 0.75rem; color: var(--gray-500);">${s.department} • ${s.year}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge badge-verified">
              ${topSkill.name} (${topSkill.score}/100 • ${topSkill.rank})
            </span>
          </td>
          <td>
            <strong>${s.tasksCompleted || 0}</strong> gigs
          </td>
          <td>
            <span style="color: #b45309; font-weight: 700;">★ ${s.rating || 5.0}</span>
          </td>
          <td>
            <strong style="color: var(--success);">${s.trustScore || 75}/100</strong>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 1rem;">${s.xp || 0} XP</strong>
          </td>
        </tr>
      `;
    }).join("");
  }

  /* ==========================================================================
     Event Bindings & Global Setup
     ========================================================================== */

  function bindEvents() {
    // Navigation tabs
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.target);
      });
    });

    // Role switcher buttons
    document.querySelectorAll(".role-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchRole(btn.dataset.role);
      });
    });

    // Task Search & Filters
    const searchInput = document.getElementById("task-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        taskFilter.search = e.target.value;
        renderTasks();
      });
    }

    const skillFilter = document.getElementById("task-filter-skill");
    if (skillFilter) {
      skillFilter.addEventListener("change", e => {
        taskFilter.skill = e.target.value;
        renderTasks();
      });
    }

    const diffFilter = document.getElementById("task-filter-diff");
    if (diffFilter) {
      diffFilter.addEventListener("change", e => {
        taskFilter.difficulty = e.target.value;
        renderTasks();
      });
    }

    // Modal backdrop click to dismiss
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", e => {
        if (e.target === backdrop) {
          closeModal(backdrop.id);
        }
      });
    });

    // Close user dropdown if clicking outside
    document.addEventListener("click", e => {
      const trigger = document.getElementById("user-menu-trigger");
      const dropdown = document.getElementById("user-menu-dropdown");
      if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        closeUserMenu();
      }
    });

    // Escape key closes modals
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.active").forEach(m => {
          closeModal(m.id);
        });
        closeUserMenu();
      }
    });

    // Post Task Form
    const postForm = document.getElementById("form-post-task");
    if (postForm) {
      postForm.addEventListener("submit", handlePostTaskSubmit);
    }
  }

  // Expose Global Handlers for inline HTML triggers
  window.switchTab = switchTab;
  window.switchRole = switchRole;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.resetToSeedData = () => {
    resetToSeedData();
    syncSessionUI();
    switchTab("dashboard");
  };

  // Auth Handlers
  window.openAuthModal = openAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.handleLoginSubmit = handleLoginSubmit;
  window.handleStudentSignUpSubmit = handleStudentSignUpSubmit;
  window.handleClientSignUpSubmit = handleClientSignUpSubmit;
  window.quickLogin = quickLogin;
  window.handleLogout = handleLogout;
  window.toggleUserMenu = toggleUserMenu;
  window.closeUserMenu = closeUserMenu;

  // Assessment & Quiz Handlers
  window.startAssessment = startAssessment;
  window.selectQuizOption = selectQuizOption;
  window.nextQuizQuestion = nextQuizQuestion;
  window.submitQuiz = submitQuiz;

  // Task Lifecycle Handlers
  window.openApplyModal = openApplyModal;
  window.submitTaskApplication = submitTaskApplication;
  window.manageTaskApplicants = manageTaskApplicants;
  window.assignStudentToTask = assignStudentToTask;
  window.openRatingModal = openRatingModal;
  window.setStarRating = setStarRating;
  window.submitTaskRating = submitTaskRating;
  window.viewTaskDetails = viewTaskDetails;

  // Peer Swap Handlers
  window.openSwapModal = openSwapModal;
  window.submitSwapProposal = submitSwapProposal;

  // Initialize App on DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    syncSessionUI();
    bindEvents();
    switchTab("dashboard");
  });

})();
