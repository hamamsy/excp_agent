// EXCP Agent HR - Main Application
(function() {
  const container = document.getElementById('viewContainer');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const STORAGE_KEY = 'excphr_currentUser';
  let _convertCvId = null;
  let dashboardTab = 'general';
  let dashboardStageFilterJobId = '';
  let dashboardStageFilterClientId = '';
  let dashboardStageFilterAgentId = '';
  let dashboardStageFilterHrId = '';
  let dashboardPerfAgentId = '';
  let agentHrChart, agentStageChart, agentActChart;
  let generalCandChart, generalHrChart, generalCountryChart;
  let selectedTaeedDetailId = null;
  let selectedIssuedVisaDetailId = null;

  // --- AUTH ---
  function getCurrentUser() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return mockUsers.find(u => u.id === parsed.id) || null;
      }
    } catch (e) {}
    return null;
  }

  function setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id }));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    updateHeaderUser();
    applyRoleNav();
  }

  function isAdmin() {
    const u = getCurrentUser();
    return u && u.role === 'admin';
  }

  function updateHeaderUser() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const avatarEl = document.getElementById('headerAvatar');
    if (!nameEl || !roleEl || !avatarEl) return;
    if (u) {
      nameEl.textContent = u.name;
      roleEl.textContent = (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1);
      avatarEl.querySelector('.avatar') ? avatarEl.querySelector('.avatar').textContent = u.avatar : (avatarEl.innerHTML = `<span class="avatar">${u.avatar}</span>`);
    } else {
      nameEl.textContent = '-';
      roleEl.textContent = '-';
    }
  }

  function applyRoleNav() {
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = isAdmin() ? '' : 'none';
    });
  }

  // --- AGENT SCOPE: filter data by current user's agent ---
  function hrBelongsToCurrentAgent(hr) {
    const u = getCurrentUser();
    if (!u || isAdmin()) return true;
    const assignedUser = mockUsers.find(x => x.id === hr.assignedAgentId);
    return assignedUser && assignedUser.agentId === u.agentId;
  }

  function getVisibleHiringRequests() {
    return mockHiringRequests.filter(hr => hrBelongsToCurrentAgent(hr));
  }

  function getVisibleHrIds() {
    return getVisibleHiringRequests().map(hr => hr.id);
  }

  function getVisibleJobIds() {
    return [...new Set(getVisibleHiringRequests().map(hr => hr.jobId))];
  }

  /** Candidates visible to current user: admin sees all; agent sees only candidates belonging to their agent. */
  function getVisibleCandidates() {
    const u = getCurrentUser();
    if (!u || isAdmin()) return mockCandidates;
    return mockCandidates.filter(c => c.agentId === u.agentId);
  }

  /** Returns the current (single) assignment for a candidate: { hrId, jobId } or null. Used to enforce one active job per candidate. */
  function getCandidateActiveAssignment(candidateId) {
    for (const hrId of Object.keys(mockAssignments)) {
      const a = mockAssignments[hrId];
      if (!a) continue;
      const inAnyStage = Object.values(a).some(arr => Array.isArray(arr) && arr.includes(candidateId));
      if (inAnyStage) {
        const hr = mockHiringRequests.find(h => h.id === hrId);
        return hr ? { hrId, jobId: hr.jobId } : { hrId, jobId: null };
      }
    }
    return null;
  }

  function getVisibleJobs() {
    const ids = getVisibleJobIds();
    return mockJobs.filter(j => ids.includes(j.id));
  }

  /** Hiring Stages dashboard: admin sees all HRs; agent sees only HRs assigned to him (assignedAgentId === current user). */
  function getVisibleHiringRequestsForDashboard() {
    const u = getCurrentUser();
    if (!u) return [];
    if (isAdmin()) return mockHiringRequests;
    return mockHiringRequests.filter(hr => hr.assignedAgentId === u.id);
  }

  /** Jobs that have at least one HR in the dashboard-visible HR list (for filter dropdowns and scope). */
  function getVisibleJobsForDashboard() {
    const hrs = getVisibleHiringRequestsForDashboard();
    const jobIds = [...new Set(hrs.map(hr => hr.jobId))];
    return mockJobs.filter(j => jobIds.includes(j.id));
  }

  function getVisibleAuthorizations() {
    const hrIds = getVisibleHrIds();
    return (mockAgentAuthorizations || []).filter(aa => !aa.hiringRequestId || hrIds.includes(aa.hiringRequestId));
  }

  function getVisibleCVs() {
    const u = getCurrentUser();
    if (!u) return [];
    if (isAdmin()) return mockCVs || [];
    return (mockCVs || []).filter(cv => cv.uploadedByUserId === u.id);
  }

  function login(email, password) {
    const u = mockUsers.find(x => (x.email || '').toLowerCase() === (email || '').toLowerCase() && x.password === password);
    return u || null;
  }

  function logout() {
    setCurrentUser(null);
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
  }

  function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    setCurrentUser(getCurrentUser());
    showView('dashboard');
  }

  function render(html) {
    if (container) container.innerHTML = html;
  }

  function setActiveNav(view) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
  }

  function skillNames(c) {
    const s = c.skills || [];
    return s.map(x => typeof x === 'string' ? x : (x && x.name) || '').filter(Boolean).join(', ');
  }

  function applyDashboardStageFilters() {
    dashboardStageFilterJobId = (document.getElementById('dashboardFilterJob') && document.getElementById('dashboardFilterJob').value) || '';
    dashboardStageFilterClientId = (document.getElementById('dashboardFilterClient') && document.getElementById('dashboardFilterClient').value) || '';
    dashboardStageFilterAgentId = (document.getElementById('dashboardFilterAgent') && document.getElementById('dashboardFilterAgent').value) || '';
    dashboardStageFilterHrId = (document.getElementById('dashboardFilterHr') && document.getElementById('dashboardFilterHr').value) || '';
    renderDashboard();
  }

  function getDashboardFilteredHrsAndJobs() {
    const visibleHrs = getVisibleHiringRequestsForDashboard();
    const visibleJobs = getVisibleJobsForDashboard();
    let filteredHrs = visibleHrs;
    if (dashboardStageFilterJobId) filteredHrs = filteredHrs.filter(hr => hr.jobId === dashboardStageFilterJobId);
    if (dashboardStageFilterClientId) filteredHrs = filteredHrs.filter(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      return job && job.clientId === dashboardStageFilterClientId;
    });
    if (dashboardStageFilterAgentId) filteredHrs = filteredHrs.filter(hr => hr.assignedAgentId === dashboardStageFilterAgentId);
    if (dashboardStageFilterHrId) filteredHrs = filteredHrs.filter(hr => hr.id === dashboardStageFilterHrId);
    return { visibleHrs, visibleJobs, filteredHrs };
  }

  // --- DASHBOARD ---
  function renderDashboard() {
    const isGeneral = (dashboardTab === 'general');
    const isHiringStagesTab = (dashboardTab === 'hiring-stages');
    const isAgentPerfTab = (dashboardTab === 'agent-performance');
    const tabsHtml = `
      <div class="dashboard-tabs">
        <button type="button" class="dashboard-tab ${isGeneral ? 'active' : ''}" onclick="app.showView('dashboard','general')">General</button>
        <button type="button" class="dashboard-tab ${isHiringStagesTab ? 'active' : ''}" onclick="app.showView('dashboard','hiring-stages')">Hiring Stages</button>
        <button type="button" class="dashboard-tab ${isAgentPerfTab ? 'active' : ''}" onclick="app.showView('dashboard','agent-performance')">Agent Performance</button>
      </div>
    `;

    if (dashboardTab === 'agent-performance') {
      [generalCandChart, generalHrChart, generalCountryChart].forEach(ch => { try { ch && ch.destroy(); } catch (e) {} });
      const user = getCurrentUser();
      const allAgents = (typeof mockAgents !== 'undefined' ? mockAgents : []);
      if (!isAdmin()) {
        // lock to current user's agent
        const agentId = user?.agentId || null;
        dashboardPerfAgentId = agentId || '';
      } else if (!dashboardPerfAgentId && allAgents.length) {
        dashboardPerfAgentId = allAgents[0].id;
      }

      const agentFilterHtml = isAdmin() ? `
        <div class="dashboard-stage-filters" style="margin-bottom:1rem;">
          <div class="dashboard-stage-filter">
            <label for="perfAgentFilter">Agent</label>
            <select id="perfAgentFilter" onchange="app.changePerfAgent(this.value)">
              ${allAgents.map(ag => `<option value="${ag.id}" ${dashboardPerfAgentId === ag.id ? 'selected' : ''}>${ag.code || ''} - ${ag.name}</option>`).join('')}
            </select>
          </div>
        </div>
      ` : '';

      const hrsForAgent = (typeof mockHiringRequests !== 'undefined' ? mockHiringRequests : []).filter(hr => {
        const u = mockUsers.find(x => x.id === hr.assignedAgentId);
        if (!u) return false;
        return dashboardPerfAgentId ? u.agentId === dashboardPerfAgentId : true;
      });
      const jobsForAgent = [...new Set(hrsForAgent.map(hr => hr.jobId))].map(id => mockJobs.find(j => j.id === id)).filter(Boolean);

      // Pie 1: hiring requests per job (count of HR by job)
      const hrByJob = {};
      hrsForAgent.forEach(hr => {
        hrByJob[hr.jobId] = (hrByJob[hr.jobId] || 0) + 1;
      });
      const hrJobEntries = Object.entries(hrByJob).map(([jobId, count]) => {
        const job = mockJobs.find(j => j.id === jobId);
        return { jobTitle: job?.title || jobId, count };
      });

      // Column chart: on track vs late candidate stages
      let perfOnTrack = 0;
      let perfLate = 0;
      hrsForAgent.forEach(hr => {
        const job = mockJobs.find(j => j.id === hr.jobId);
        if (!job) return;
        const assignments = getHiringRequestAssignments(hr.id);
        Object.entries(assignments).forEach(([stage, arr]) => {
          (arr || []).forEach(cid => {
            const kpi = getCandidateStageKpi(cid, stage, job.id);
            if (!kpi) return;
            if (kpi.status === 'late') perfLate += 1;
            else perfOnTrack += 1;
          });
        });
      });

      // Pie 2: activity logs KPI (excellent / normal / late) based on stage-change logs
      let actExcellent = 0;
      let actNormal = 0;
      let actLate = 0;
      (mockActivities || []).forEach(a => {
        if (a.type !== 'stage' || a.subtype !== 'stageChange') return;
        const u = mockUsers.find(x => x.id === a.assigneeId);
        if (!u) return;
        if (dashboardPerfAgentId && u.agentId !== dashboardPerfAgentId) return;
        const kpi = getStageActivityKpi(a);
        if (!kpi) return;
        if (kpi.status === 'late') actLate += 1;
        else if (kpi.status === 'excellent') actExcellent += 1;
        else actNormal += 1;
      });

      const totalHr = hrsForAgent.length;
      const totalPerf = perfOnTrack + perfLate;
      const totalActs = actExcellent + actNormal + actLate;

      const hrLegend = hrJobEntries.length ? hrJobEntries.map(e => `
        <div class="chart-legend-item">
          <span class="chart-legend-dot"></span>
          <span class="chart-legend-label">${e.jobTitle}</span>
          <span class="chart-legend-value">${e.count}</span>
        </div>
      `).join('') : '';

      render(`
        <div class="dashboard-page">
          ${tabsHtml}
          ${agentFilterHtml}
          <div class="agent-perf-grid">
            <div class="agent-perf-card">
              <div class="card-title">Hiring Requests by Job</div>
              <p class="chart-subtitle">Total HRs: ${totalHr}</p>
              ${totalHr ? `<canvas id="agentHrPie" height="180"></canvas>` : '<p class="empty-state">No hiring requests for this agent.</p>'}
              ${hrLegend ? `<div class="chart-legend" style="margin-top:0.75rem;">${hrLegend}</div>` : ''}
            </div>
            <div class="agent-perf-card">
              <div class="card-title">Candidate Stage Performance</div>
              <p class="chart-subtitle">On track vs Late candidates across all stages</p>
              ${totalPerf ? `<canvas id="agentStageBar" height="180"></canvas>` : '<p class="empty-state">No candidates assigned for this agent.</p>'}
            </div>
            <div class="agent-perf-card">
              <div class="card-title">Stage Activities by KPI</div>
              <p class="chart-subtitle">Stage-change logs grouped by KPI status</p>
              ${totalActs ? `<canvas id="agentActPie" height="180"></canvas>` : '<p class="empty-state">No stage activities for this agent.</p>'}
            </div>
          </div>
        </div>
      `);
      // Render charts using Chart.js if available
      if (typeof Chart !== 'undefined') {
        renderAgentPerformanceCharts({
          hrJobEntries,
          perfOnTrack,
          perfLate,
          actExcellent,
          actNormal,
          actLate
        });
      }
      return;
    }
    if (dashboardTab === 'hiring-stages') {
      [generalCandChart, generalHrChart, generalCountryChart].forEach(ch => { try { ch && ch.destroy(); } catch (e) {} });
      // Admin: all HRs/jobs. Agent: only HRs assigned to him and jobs that have those HRs.
      const { visibleHrs, visibleJobs, filteredHrs } = getDashboardFilteredHrsAndJobs();

      const assignedCandidateIds = new Set();
      filteredHrs.forEach(hr => {
        const a = getHiringRequestAssignments(hr.id);
        (typeof DEFAULT_STAGES !== 'undefined' ? DEFAULT_STAGES : []).forEach(stage => {
          (a[stage] || []).forEach(id => assignedCandidateIds.add(id));
        });
      });
      const totalRequired = filteredHrs.reduce((s, hr) => s + (hr.required || 0), 0);
      const assignedCount = assignedCandidateIds.size;
      const notAssignedCount = Math.max(0, totalRequired - assignedCount);

      const stageCounts = (typeof DEFAULT_STAGES !== 'undefined' ? DEFAULT_STAGES : []).map(stage => {
        const count = filteredHrs.reduce((sum, hr) => sum + ((getHiringRequestAssignments(hr.id)[stage] || []).length), 0);
        return { stage, count };
      });

      const stageKpiStats = (typeof DEFAULT_STAGES !== 'undefined' ? DEFAULT_STAGES : []).map(stage => {
        let late = 0;
        let onTrack = 0;
        filteredHrs.forEach(hr => {
          const job = mockJobs.find(j => j.id === hr.jobId);
          if (!job) return;
          const assignments = getHiringRequestAssignments(hr.id);
          (assignments[stage] || []).forEach(cid => {
            const kpi = getCandidateStageKpi(cid, stage, job.id);
            if (!kpi) return;
            if (kpi.status === 'late') late += 1;
            else onTrack += 1;
          });
        });
        return { stage, late, onTrack };
      });

      const clientIdsFromJobs = [...new Set(visibleJobs.map(j => j.clientId).filter(Boolean))];
      const clientsForFilter = (mockClients || []).filter(c => clientIdsFromJobs.includes(c.id));
      const agentIdsFromHrs = [...new Set(visibleHrs.map(hr => hr.assignedAgentId).filter(Boolean))];
      const agentsForFilter = (mockUsers || []).filter(u => agentIdsFromHrs.includes(u.id));
      let hrsForHrDropdown = visibleHrs;
      if (dashboardStageFilterJobId) hrsForHrDropdown = hrsForHrDropdown.filter(hr => hr.jobId === dashboardStageFilterJobId);
      if (dashboardStageFilterClientId) hrsForHrDropdown = hrsForHrDropdown.filter(hr => {
        const job = mockJobs.find(j => j.id === hr.jobId);
        return job && job.clientId === dashboardStageFilterClientId;
      });
      if (dashboardStageFilterAgentId) hrsForHrDropdown = hrsForHrDropdown.filter(hr => hr.assignedAgentId === dashboardStageFilterAgentId);
      if (dashboardStageFilterHrId && !hrsForHrDropdown.some(hr => hr.id === dashboardStageFilterHrId)) dashboardStageFilterHrId = '';

      const filterRow = `
        <div class="dashboard-stage-filters">
          <div class="dashboard-stage-filter">
            <label for="dashboardFilterJob">Job</label>
            <select id="dashboardFilterJob" onchange="app.applyDashboardStageFilters()">
              <option value="">All jobs</option>
              ${visibleJobs.map(j => `<option value="${j.id}" ${dashboardStageFilterJobId === j.id ? 'selected' : ''}>${j.title || j.id}</option>`).join('')}
            </select>
          </div>
          <div class="dashboard-stage-filter">
            <label for="dashboardFilterClient">Customer</label>
            <select id="dashboardFilterClient" onchange="app.applyDashboardStageFilters()">
              <option value="">All customers</option>
              ${clientsForFilter.map(c => `<option value="${c.id}" ${dashboardStageFilterClientId === c.id ? 'selected' : ''}>${c.name || c.id}</option>`).join('')}
            </select>
          </div>
          <div class="dashboard-stage-filter">
            <label for="dashboardFilterAgent">Agent</label>
            <select id="dashboardFilterAgent" onchange="app.applyDashboardStageFilters()">
              <option value="">All agents</option>
              ${agentsForFilter.map(u => `<option value="${u.id}" ${dashboardStageFilterAgentId === u.id ? 'selected' : ''}>${u.name || u.id}</option>`).join('')}
            </select>
          </div>
          <div class="dashboard-stage-filter">
            <label for="dashboardFilterHr">Hiring request</label>
            <select id="dashboardFilterHr" onchange="app.applyDashboardStageFilters()">
              <option value="">All hiring requests</option>
              ${hrsForHrDropdown.map(hr => {
                const job = mockJobs.find(j => j.id === hr.jobId);
                const label = (job ? job.title + ' – ' : '') + (hr.number || hr.id);
                return `<option value="${hr.id}" ${dashboardStageFilterHrId === hr.id ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>
          </div>
        </div>
      `;

      const notAssignedCard = `
        <div class="dashboard-stage-card dashboard-stage-card-not-assigned">
          <div class="dashboard-stage-name">Not Assigned</div>
          <button type="button" class="dashboard-stage-count-btn" disabled>${notAssignedCount}</button>
          <div class="dashboard-stage-sub">candidates</div>
        </div>
      `;
      const stageCardsHtml = stageCounts.map(({ stage, count }) => {
        const stat = stageKpiStats.find(s => s.stage === stage) || { late: 0, onTrack: 0 };
        return `
          <div class="dashboard-stage-card">
            <div class="dashboard-stage-name">${stage}</div>
            <button type="button" class="dashboard-stage-count-btn" onclick="app.openDashboardStageDetails('${stage.replace(/'/g, "\\'")}')">${count}</button>
            <div class="dashboard-stage-sub">candidates</div>
            <div class="dashboard-stage-kpi-breakdown">
              <span class="kpi-dot kpi-dot-late"></span><span class="kpi-label">Late: ${stat.late}</span>
              <span class="kpi-separator">·</span>
              <span class="kpi-dot kpi-dot-ontrack"></span><span class="kpi-label">On track: ${stat.onTrack}</span>
            </div>
          </div>
        `;
      }).join('');
      render(`
        <div class="dashboard-page">
          ${tabsHtml}
          ${filterRow}
          <div class="dashboard-stage-grid">
            ${notAssignedCard}
            ${stageCardsHtml}
          </div>
        </div>
      `);
      return;
    }

    const jobs = getVisibleJobs();
    const activeJobs = jobs.filter(j => j.status === 'active');
    const totalJobs = activeJobs.length;
    const visibleCandidates = getVisibleCandidates();
    const totalCandidates = visibleCandidates.length;
    const placementsYtd = visibleCandidates.filter(c => c.status === 'hired').length;
    const placementTarget = 100;
    const pipelineValueSar = Math.round((placementsYtd * 6000) + (visibleCandidates.filter(c => c.status === 'available').length * 2000));
    const pipelineValueDisplay = pipelineValueSar >= 1000000 ? (pipelineValueSar / 1000000).toFixed(1) + 'M' : (pipelineValueSar / 1000).toFixed(0) + 'k';
    const medicalCount = activeJobs.filter(j => (j.clientName || '').toLowerCase().includes('hospital') || (j.clientName || '').toLowerCase().includes('medical')).length;
    const otherCount = totalJobs - medicalCount;
    const jobsBreakdown = medicalCount || otherCount ? `Healthcare: ${medicalCount}, Other: ${otherCount}` : '';
    const recentJobs = jobs.slice(0, 4);
    const recentActivities = (mockActivities || []).slice(0, 5).map(a => {
      const job = mockJobs.find(j => j.id === a.jobId);
      let actionText = '';
      let detail = job ? (job.title || '') + (job.clientName ? ' @ ' + job.clientName : '') : a.title;
      if (a.type === 'stage' && a.title) {
        if (a.title.includes('Placed')) actionText = (a.relatedTo || '').toUpperCase() + ' HIRED';
        else if (a.title.includes('moved')) actionText = (a.relatedTo || '').toUpperCase() + ' STAGE';
        else actionText = (a.relatedTo || '').toUpperCase() + ' ADDED';
      } else if (a.type === 'interview') actionText = (a.relatedTo || 'Interview').toUpperCase() + ' INTERVIEW';
      else if (a.type === 'call' || a.type === 'email') actionText = (a.title || 'Activity').toUpperCase();
      else actionText = (a.title || 'Activity').split(' ').slice(0, 4).join(' ').toUpperCase();
      return { action: actionText || 'Activity', detail: detail || a.title, date: a.date };
    });

    const jobIcon = (j) => {
      const isMedical = (j.clientName || '').toLowerCase().includes('hospital') || (j.clientName || '').includes('medical');
      return isMedical ? 'fa-stethoscope' : 'fa-hard-hat';
    };

    const salaryRange = (j) => {
      const min = parseFloat(j.minSalary);
      const max = parseFloat(j.maxSalary);
      if (min && max) return 'SAR ' + (min >= 1000 ? (min/1000) + 'k' : min) + ' - ' + (max >= 1000 ? (max/1000) + 'k' : max);
      return (j.salary || '-').replace('SR ', 'SAR ').replace(' SAR', '');
    };

    // Chart data for General dashboard
    const candidatesPerAgent = {};
    (getVisibleCandidates()).forEach(c => {
      const aid = c.agentId || '_none';
      candidatesPerAgent[aid] = (candidatesPerAgent[aid] || 0) + 1;
    });
    const candPerAgentEntries = Object.entries(candidatesPerAgent).map(([aid, count]) => {
      if (aid === '_none') return { label: 'Unassigned', count };
      const ag = (mockAgents || []).find(a => a.id === aid);
      return { label: ag ? (ag.code || ag.name) : aid, count };
    }).filter(e => e.count > 0);

    const hrsPerAgent = {};
    (getVisibleHiringRequests()).forEach(hr => {
      const u = mockUsers.find(x => x.id === hr.assignedAgentId);
      const aid = u?.agentId || '_none';
      hrsPerAgent[aid] = (hrsPerAgent[aid] || 0) + 1;
    });
    const hrPerAgentEntries = Object.entries(hrsPerAgent).map(([aid, count]) => {
      if (aid === '_none') return { label: 'Unassigned', count };
      const ag = (mockAgents || []).find(a => a.id === aid);
      return { label: ag ? (ag.code || ag.name) : aid, count };
    }).filter(e => e.count > 0);

    const agentsPerCountry = {};
    (mockAgents || []).forEach(a => {
      const c = (a.country || '').trim() || '_unknown';
      agentsPerCountry[c] = (agentsPerCountry[c] || 0) + 1;
    });
    const agentsPerCountryEntries = Object.entries(agentsPerCountry).map(([country, count]) => ({
      label: country === '_unknown' ? 'Unknown' : country,
      count
    }));

    render(`
      <div class="dashboard-page">
        ${tabsHtml}
        <div class="dashboard-kpi-row">
          <div class="kpi-card">
            <span class="kpi-tag">KSA</span>
            <div class="kpi-icon kpi-icon-green"><i class="fas fa-briefcase"></i></div>
            <div class="kpi-title">ACTIVE JOBS</div>
            <div class="kpi-value">${totalJobs}</div>
            <div class="kpi-sub">${jobsBreakdown || 'No breakdown'}</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-tag">KSA</span>
            <div class="kpi-icon kpi-icon-lime"><i class="fas fa-users"></i></div>
            <div class="kpi-title">TOTAL CANDIDATES</div>
            <div class="kpi-value">${totalCandidates}</div>
            <div class="kpi-sub">+12% from last month</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-tag">KSA</span>
            <div class="kpi-icon kpi-icon-teal"><i class="fas fa-check-circle"></i></div>
            <div class="kpi-title">PLACEMENTS (YTD)</div>
            <div class="kpi-value">${placementsYtd}</div>
            <div class="kpi-sub">Target: ${placementTarget}</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-tag">KSA</span>
            <div class="kpi-icon kpi-icon-dark"><i class="fas fa-chart-line"></i></div>
            <div class="kpi-title">PIPELINE VALUE</div>
            <div class="kpi-value">${pipelineValueDisplay} SAR</div>
            <div class="kpi-sub">Projected Revenue</div>
          </div>
        </div>
        <div class="agent-perf-grid" style="margin-top:1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
          <div class="agent-perf-card card">
            <div class="card-title">Candidates per Agent</div>
            <p class="chart-subtitle">Candidate count by agent</p>
            ${candPerAgentEntries.length ? `<canvas id="generalCandChart" height="180"></canvas>` : '<p class="empty-state">No candidates</p>'}
          </div>
          <div class="agent-perf-card card">
            <div class="card-title">Hiring Requests per Agent</div>
            <p class="chart-subtitle">HR / Jobs count per agent</p>
            ${hrPerAgentEntries.length ? `<canvas id="generalHrChart" height="180"></canvas>` : '<p class="empty-state">No hiring requests</p>'}
          </div>
          <div class="agent-perf-card card">
            <div class="card-title">Agents per Country</div>
            <p class="chart-subtitle">Agent count by country</p>
            ${agentsPerCountryEntries.length ? `<canvas id="generalCountryChart" height="180"></canvas>` : '<p class="empty-state">No agents</p>'}
          </div>
        </div>
        <div class="dashboard-bottom-row">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>RECENT JOBS</h3>
              <a href="#" class="dashboard-link" onclick="app.showView('jobs'); return false;">ALL JOBS</a>
            </div>
            <div class="recent-jobs-list">
              ${recentJobs.length ? recentJobs.map(j => `
                <div class="recent-job-item" onclick="app.showJob('${j.id}')">
                  <div class="recent-job-icon"><i class="fas ${jobIcon(j)}"></i></div>
                  <div class="recent-job-body">
                    <div class="recent-job-meta">${salaryRange(j)}</div>
                    <div class="recent-job-title">${j.title}</div>
                    <div class="recent-job-location">${j.clientName || ''} • ${(j.location || '').split(',')[0] || 'KSA'}</div>
                  </div>
                  <span class="recent-job-badge badge-${j.status === 'active' ? 'active' : 'inactive'}">${(j.status || 'active').toUpperCase()}</span>
                </div>
              `).join('') : '<p class="empty-state">No jobs yet</p>'}
            </div>
          </div>
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3>RECENT ACTIVITY</h3>
              <a href="#" class="dashboard-link" onclick="app.showView('activities'); return false;">SEE ALL</a>
            </div>
            <div class="recent-activity-list">
              ${recentActivities.length ? recentActivities.map(a => `
                <div class="recent-activity-item">
                  <div class="recent-activity-action">${a.action}</div>
                  <div class="recent-activity-detail">${a.detail}</div>
                  <div class="recent-activity-date"><i class="fas fa-clock"></i> ${a.date}</div>
                </div>
              `).join('') : '<p class="empty-state">No recent activity</p>'}
            </div>
          </div>
        </div>
      </div>
    `);
    if (typeof Chart !== 'undefined') {
      setTimeout(() => renderDashboardGeneralCharts({
        candPerAgentEntries,
        hrPerAgentEntries,
        agentsPerCountryEntries
      }), 0);
    }
  }

  function renderDashboardGeneralCharts(data) {
    const { candPerAgentEntries, hrPerAgentEntries, agentsPerCountryEntries } = data;
    [generalCandChart, generalHrChart, generalCountryChart].forEach(ch => {
      try { ch && ch.destroy(); } catch (e) {}
    });

    const colors = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#6366f1', '#ec4899', '#14b8a6'];
    const getColor = (i) => colors[i % colors.length];

    const candCtx = document.getElementById('generalCandChart')?.getContext?.('2d');
    if (candCtx && candPerAgentEntries.length) {
      generalCandChart = new Chart(candCtx, {
        type: 'bar',
        data: {
          labels: candPerAgentEntries.map(e => e.label),
          datasets: [{
            label: 'Candidates',
            data: candPerAgentEntries.map(e => e.count),
            backgroundColor: candPerAgentEntries.map((_, i) => getColor(i))
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: { x: { beginAtZero: true, precision: 0 } },
          plugins: { legend: { display: false } }
        }
      });
    }

    const hrCtx = document.getElementById('generalHrChart')?.getContext?.('2d');
    if (hrCtx && hrPerAgentEntries.length) {
      generalHrChart = new Chart(hrCtx, {
        type: 'bar',
        data: {
          labels: hrPerAgentEntries.map(e => e.label),
          datasets: [{
            label: 'Hiring Requests',
            data: hrPerAgentEntries.map(e => e.count),
            backgroundColor: hrPerAgentEntries.map((_, i) => getColor(i))
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: { x: { beginAtZero: true, precision: 0 } },
          plugins: { legend: { display: false } }
        }
      });
    }

    const countryCtx = document.getElementById('generalCountryChart')?.getContext?.('2d');
    if (countryCtx && agentsPerCountryEntries.length) {
      generalCountryChart = new Chart(countryCtx, {
        type: 'pie',
        data: {
          labels: agentsPerCountryEntries.map(e => e.label),
          datasets: [{
            data: agentsPerCountryEntries.map(e => e.count),
            backgroundColor: agentsPerCountryEntries.map((_, i) => getColor(i))
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  // --- JOBS LIST ---
  function renderJobsList() {
    const statusFilter = document.getElementById('jobFilterStatus')?.value || '';
    const priorityFilter = document.getElementById('jobFilterPriority')?.value || '';
    const jobs = getVisibleJobs();
    const filtered = jobs.filter(j => (!statusFilter || j.status === statusFilter) && (!priorityFilter || j.priority === priorityFilter));
    render(`
      <div class="page-header">
        <h1 class="page-title">Jobs</h1>
        <button class="btn btn-primary" onclick="app.openCreateJob()"><i class="fas fa-plus"></i> Create Job</button>
      </div>
      <div class="card filters-bar" style="margin-bottom:1rem;">
        <select id="jobFilterStatus" onchange="app.showView('jobs')"><option value="">All Status</option><option value="active" ${statusFilter==='active'?'selected':''}>Active</option></select>
        <select id="jobFilterPriority" onchange="app.showView('jobs')"><option value="">All Priority</option><option value="high" ${priorityFilter==='high'?'selected':''}>High</option></select>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Job Title</th><th>Client</th><th>Required</th><th>Filled</th><th>Nationality</th><th>Owner</th><th>Status</th><th>Priority</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${filtered.map(j => {
                const t = getJobTotals(j.id);
                return `
                <tr>
                  <td><strong>${j.title}</strong></td>
                  <td>${j.clientName}</td>
                  <td>${t.required}</td>
                  <td>${t.filled}</td>
                  <td>${j.nationality || '-'}</td>
                  <td><span class="avatar" style="width:24px;height:24px;font-size:0.7rem;">${j.ownerAvatar}</span> ${j.owner}</td>
                  <td><span class="badge badge-${j.status}">${j.status}</span></td>
                  <td><span class="badge badge-high">${j.priority}</span></td>
                  <td><button class="btn btn-secondary btn-sm" onclick="app.showJob('${j.id}')">Open</button></td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  function getAuthDisplay(aa) {
    const client = mockClients.find(c => c.id === aa.clientId);
    const hr = mockHiringRequests.find(h => h.id === aa.hiringRequestId);
    const job = hr ? mockJobs.find(j => j.id === hr.jobId) : null;
    const agent = mockUsers.find(u => u.id === aa.agentId);
    const nationality = (typeof mockNationalities !== 'undefined' ? mockNationalities : []).find(n => n.id === aa.nationalityId);
    const mainAgent = (typeof mockAgents !== 'undefined' ? mockAgents : []).find(a => a.id === aa.mainAgentId);
    const eWakala = (typeof mockAgents !== 'undefined' ? mockAgents : []).find(a => a.id === aa.eWakalaAgentId);
    return {
      clientName: client?.name || '-',
      hrDisplay: hr && job ? `${hr.number} (${job.title})` : '-',
      agentName: agent?.name || '-',
      nationalityName: nationality?.name || '-',
      mainAgentName: mainAgent?.name || '-',
      eWakalaName: eWakala?.name || '-'
    };
  }

  function renderAuthorizations() {
    const list = getVisibleAuthorizations();
    render(`
      <div class="page-header">
        <h1 class="page-title">Authorizations</h1>
        ${isAdmin() ? `<button class="btn btn-primary" onclick="app.openAddAuthorization()"><i class="fas fa-plus"></i> Add Authorization</button>` : ''}
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Code</th><th>Agent</th><th>Client</th><th>Hiring Request</th><th>Visa</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.map(aa => {
                const d = getAuthDisplay(aa);
                const hrForJob = mockHiringRequests.find(h => h.id === aa.hiringRequestId);
                const jobIdForLink = hrForJob?.jobId || '';
                const visa = hrForJob?.visaNumber || '-';
                return `
                <tr>
                  <td><strong>${aa.code || '-'}</strong></td>
                  <td>${isAdmin() ? `<a href="#" class="lookup-link" onclick="app.renderEditAuthorization('${aa.id}'); return false;">${d.agentName}</a>` : d.agentName}</td>
                  <td><a href="#" class="lookup-link" onclick="app.showClient('${aa.clientId || ''}'); return false;">${d.clientName}</a></td>
                  <td><a href="#" class="lookup-link" onclick="app.showJobHr('${jobIdForLink}', '${aa.hiringRequestId || ''}'); return false;">${d.hrDisplay}</a></td>
                  <td>${visa}</td>
                  <td>${isAdmin() ? `<button class="btn btn-secondary btn-sm" onclick="app.renderEditAuthorization('${aa.id}')">Edit</button>` : ''}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${list.length === 0 ? '<p class="empty-state">No authorizations yet.</p>' : ''}
      </div>
    `);
  }

  function buildAuthorizationFormHtml(auth) {
    const clients = mockClients.map(c => `<option value="${c.id}" ${(auth && auth.clientId === c.id) ? 'selected' : ''}>${c.name}</option>`).join('');
    const hrs = mockHiringRequests.map(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      return { hr, job };
    });
    const hrOptions = hrs.map(({ hr, job }) => `<option value="${hr.id}" ${(auth && auth.hiringRequestId === hr.id) ? 'selected' : ''}>${hr.number} - ${job?.title || ''}</option>`).join('');
    const agentOptions = mockUsers.map(u => `<option value="${u.id}" ${(auth && auth.agentId === u.id) ? 'selected' : ''}>${u.name}</option>`).join('');
    const nationalities = (typeof mockNationalities !== 'undefined' ? mockNationalities : []).map(n => `<option value="${n.id}" ${(auth && auth.nationalityId === n.id) ? 'selected' : ''}>${n.name}</option>`).join('');
    const agents = (typeof mockAgents !== 'undefined' ? mockAgents : []).map(ag => `<option value="${ag.id}" ${(auth && auth.mainAgentId === ag.id) ? 'selected' : ''}>${ag.name}</option>`).join('');
    const eWakalaOptions = (typeof mockAgents !== 'undefined' ? mockAgents : []).map(ag => `<option value="${ag.id}" ${(auth && auth.eWakalaAgentId === ag.id) ? 'selected' : ''}>${ag.name}</option>`).join('');
    const authDate = auth?.authorizationDate || '';
    const inEmbassyVal = auth && auth.inEmbassy ? 'yes' : 'no';
    const enjazNotes = (auth?.enjazNotes || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const enjazName = (auth?.enjazName || '').replace(/"/g, '&quot;');
    const code = (auth?.code || '').replace(/"/g, '&quot;');
    return `
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-info-circle"></i> Basic information</h3>
        <div class="auth-form-grid">
          <div class="form-group">
            <label for="authCode">Code</label>
            <input type="text" id="authCode" value="${code}" placeholder="e.g. AUTH-001">
          </div>
          <div class="form-group">
            <label for="authAuthorizationDate">Authorization date <span class="required">*</span></label>
            <input type="date" id="authAuthorizationDate" value="${authDate}">
          </div>
          <div class="form-group form-group-full">
            <label for="authClientId">Client <span class="required">*</span></label>
            <select id="authClientId">
              <option value="">-- Select Client --</option>
              ${clients}
            </select>
          </div>
          <div class="form-group form-group-full">
            <label for="authHiringRequestId">Hiring Request <span class="required">*</span></label>
            <select id="authHiringRequestId">
              <option value="">-- Select --</option>
              ${hrOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="authAgentId">Agent <span class="required">*</span></label>
            <select id="authAgentId">
              <option value="">-- Select --</option>
              ${agentOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="authNationalityId">Nationality <span class="required">*</span></label>
            <select id="authNationalityId">
              <option value="">-- Select --</option>
              ${nationalities}
            </select>
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-user-tie"></i> Agents & embassy</h3>
        <div class="auth-form-grid">
          <div class="form-group form-group-full">
            <label for="authMainAgentId">Main Agent Name <span class="required">*</span></label>
            <select id="authMainAgentId" class="lookup-select">
              <option value="">-- Select --</option>
              ${agents}
            </select>
          </div>
          <div class="form-group form-group-full">
            <label for="authEWakalaAgentId">E-Wakala Agent <span class="required">*</span></label>
            <select id="authEWakalaAgentId" class="lookup-select">
              <option value="">-- Select --</option>
              ${eWakalaOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="authInEmbassy">In embassy</label>
            <select id="authInEmbassy">
              <option value="no" ${inEmbassyVal === 'no' ? 'selected' : ''}>No</option>
              <option value="yes" ${inEmbassyVal === 'yes' ? 'selected' : ''}>Yes</option>
            </select>
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-file-alt"></i> Enjaz details</h3>
        <div class="auth-form-fields">
          <div class="form-group">
            <label for="authEnjazName">Enjaz Name</label>
            <input type="text" id="authEnjazName" value="${enjazName}" placeholder="Enjaz name">
          </div>
          <div class="form-group">
            <label for="authEnjazNotes">Enjaz Notes</label>
            <textarea id="authEnjazNotes" rows="4" placeholder="e.g. Factory--Nat-India--Prof--Visa Number--Qty-">${enjazNotes}</textarea>
            <span class="form-hint">Structured notes; use -- as separator</span>
          </div>
        </div>
      </div>
    `;
  }

  function openAddAuthorization() {
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Add Authorization</div>
      <div class="modal-body add-hr-body">
        ${buildAuthorizationFormHtml(null)}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitAddAuthorization()">Add</button>
      </div>
    `;
  }

  function submitAddAuthorization() {
    const code = document.getElementById('authCode')?.value?.trim() || 'AUTH-' + String((mockAgentAuthorizations.length + 1)).padStart(3, '0');
    const clientId = document.getElementById('authClientId')?.value;
    const hiringRequestId = document.getElementById('authHiringRequestId')?.value;
    const hr = mockHiringRequests.find(h => h.id === hiringRequestId);
    const agentId = document.getElementById('authAgentId')?.value;
    const nationalityId = document.getElementById('authNationalityId')?.value;
    const authorizationDate = document.getElementById('authAuthorizationDate')?.value;
    const mainAgentId = document.getElementById('authMainAgentId')?.value;
    const eWakalaAgentId = document.getElementById('authEWakalaAgentId')?.value;
    const inEmbassy = document.getElementById('authInEmbassy')?.value === 'yes';
    const enjazNotes = document.getElementById('authEnjazNotes')?.value || '';
    const enjazName = document.getElementById('authEnjazName')?.value || '';
    const mainAgent = (typeof mockAgents !== 'undefined' ? mockAgents : []).find(a => a.id === mainAgentId);
    const newAuth = {
      id: 'aa' + (mockAgentAuthorizations.length + 1),
      code,
      clientId: clientId || '',
      jobId: hr?.jobId || '',
      hiringRequestId: hiringRequestId || '',
      agentId: agentId || '',
      nationalityId: nationalityId || '',
      authorizationDate: authorizationDate || '',
      mainAgentId: mainAgentId || '',
      eWakalaAgentId: eWakalaAgentId || '',
      inEmbassy: !!inEmbassy,
      enjazNotes,
      enjazName: enjazName || (mainAgent?.name || '')
    };
    mockAgentAuthorizations.push(newAuth);
    closeModal();
    renderAuthorizations();
  }

  function renderEditAuthorization(id) {
    const auth = mockAgentAuthorizations.find(a => a.id === id);
    if (!auth) return renderAuthorizations();
    const visible = getVisibleAuthorizations();
    if (!visible.some(a => a.id === id)) return renderAuthorizations();
    setActiveNav('authorizations');
    const codeDisplay = (auth.code || 'Authorization').replace(/"/g, '&quot;');
    render(`
      <div class="auth-edit-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('authorizations')"><i class="fas fa-arrow-left"></i> Authorizations</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">Edit ${codeDisplay}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Edit Authorization</h1>
          <p class="auth-edit-subtitle">Update details for <strong>${codeDisplay}</strong></p>
        </div>
        <form class="auth-edit-form" onsubmit="app.submitEditAuthorization('${id}'); return false;">
          <div class="auth-edit-body">
            ${buildAuthorizationFormHtml(auth)}
          </div>
          <div class="auth-edit-actions">
            <button type="button" class="btn btn-secondary" onclick="app.showView('authorizations')">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-check"></i> Save changes
            </button>
          </div>
        </form>
      </div>
    `);
  }

  function submitEditAuthorization(id) {
    const auth = mockAgentAuthorizations.find(a => a.id === id);
    if (!auth) return;
    const code = document.getElementById('authCode')?.value?.trim() || auth.code;
    const clientId = document.getElementById('authClientId')?.value;
    const hiringRequestId = document.getElementById('authHiringRequestId')?.value;
    const hr = mockHiringRequests.find(h => h.id === hiringRequestId);
    const agentId = document.getElementById('authAgentId')?.value;
    const nationalityId = document.getElementById('authNationalityId')?.value;
    const authorizationDate = document.getElementById('authAuthorizationDate')?.value;
    const mainAgentId = document.getElementById('authMainAgentId')?.value;
    const eWakalaAgentId = document.getElementById('authEWakalaAgentId')?.value;
    const inEmbassy = document.getElementById('authInEmbassy')?.value === 'yes';
    const enjazNotes = document.getElementById('authEnjazNotes')?.value || '';
    const enjazName = document.getElementById('authEnjazName')?.value || '';
    Object.assign(auth, {
      code,
      clientId: clientId || '',
      jobId: hr?.jobId || '',
      hiringRequestId: hiringRequestId || '',
      agentId: agentId || '',
      nationalityId: nationalityId || '',
      authorizationDate: authorizationDate || '',
      mainAgentId: mainAgentId || '',
      eWakalaAgentId: eWakalaAgentId || '',
      inEmbassy: !!inEmbassy,
      enjazNotes,
      enjazName
    });
    renderAuthorizations();
  }

  function renderHiringRequests() {
    const list = getVisibleHiringRequests().map(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      return { ...hr, jobTitle: job?.title || '-', clientName: job?.clientName || '-' };
    });
    render(`
      <div class="page-header">
        <h1 class="page-title">Hiring Requests</h1>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Number</th><th>Job</th><th>Client</th><th>Assigned Agent</th><th>Filled</th><th>Required</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.map(hr => `
                <tr>
                  <td><strong>${hr.number}</strong></td>
                  <td>${hr.jobTitle}</td>
                  <td>${hr.clientName}</td>
                  <td>${hr.assignedAgentName}</td>
                  <td>${hr.filled}</td>
                  <td>${hr.required}</td>
                  <td>
                    ${isAdmin() ? `<button class="btn btn-secondary btn-sm" onclick="app.openEditHiringRequest('${hr.id}')">Edit</button> ` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="app.showJobHr('${hr.jobId}', '${hr.id}')">Open</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${list.length === 0 ? `<p class="empty-state">${isAdmin() ? 'No hiring requests yet.' : 'No hiring requests assigned to your agent.'}</p>` : ''}
      </div>
    `);
  }

  function buildBulkStageHtml(jobId, hrId, assignments) {
    const stages = getStagesForHiringRequest(hrId);
    const candidatesByStage = stages.map(stage => {
      const candIds = assignments[stage] || [];
      return { stage, candidates: candIds.map(cid => mockCandidates.find(c => c.id === cid)).filter(Boolean) };
    });
    const totalCandidates = candidatesByStage.reduce((s, g) => s + g.candidates.length, 0);
    if (totalCandidates === 0) return '<p class="empty-state">No candidates in pipeline yet.</p>';

    const rows = candidatesByStage.filter(g => g.candidates.length > 0).map(({ stage, candidates }) => `
      <tr class="bulk-stage-row stage-header-row">
        <td colspan="4" class="stage-header">${stage}</td>
      </tr>
      ${candidates.map(c => `
        <tr class="bulk-stage-row bulk-cand-row" data-search="${(c.name + ' ' + c.title + ' ' + skillNames(c) + ' ' + stage).toLowerCase()}">
          <td><input type="checkbox" class="bulk-cand-cb" data-candidate-id="${c.id}" data-current-stage="${stage}"></td>
          <td><span class="kanban-card-avatar" style="width:28px;height:28px;font-size:0.7rem;">${c.avatar}</span> ${c.name}</td>
          <td>${c.title}</td>
          <td>${stage}</td>
        </tr>
      `).join('')}
    `).join('');

    return `
      <div class="bulk-stage-card card">
        <div class="bulk-stage-toolbar">
          <div class="bulk-search-wrap">
            <i class="fas fa-search"></i>
            <input type="text" id="bulkStageSearch" placeholder="Search by name, title, skills, stage..." class="bulk-search-input">
          </div>
          <label><input type="checkbox" id="bulkSelectAll"> Select all</label>
          <span class="bulk-selected-count" id="bulkSelectedCount">0 selected</span>
          <div class="bulk-actions">
            <span>Move selected to:</span>
            <select id="bulkTargetStage">
              ${stages.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" onclick="app.applyBulkStageChange('${jobId}','${hrId}')">Apply</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="bulk-stage-table">
            <thead><tr><th style="width:40px"></th><th>Candidate</th><th>Title</th><th>Current Stage</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function buildBulkUpdateHtml(jobId, hrId) {
    const job = mockJobs.find(j => j.id === jobId);
    const hr = mockHiringRequests.find(h => h.id === hrId);
    const auth = (mockAgentAuthorizations || []).find(aa => aa.hiringRequestId === hrId);
    const assignments = getHiringRequestAssignments(hrId);
    const candIds = Object.values(assignments || {}).flat();
    const candidates = [...new Set(candIds)].map(cid => mockCandidates.find(c => c.id === cid)).filter(Boolean);
    const cols = typeof BULK_UPDATE_COLUMNS !== 'undefined' ? BULK_UPDATE_COLUMNS : [];

    if (candidates.length === 0) return '<p class="empty-state">No candidates in this hiring request. Add candidates from the Candidates tab first.</p>';

    const getRowVal = (c, col) => {
      const k = col.key;
      if (k === 'hiringRequest') return hr?.number || '';
      if (k === 'projCode') return job?.jobReference || '';
      if (k === 'projName') return job?.title || '';
      if (k === 'authorizationNumber') return auth?.code || '';
      if (k === 'issueDate') return auth?.issueDate || auth?.authorizationDate || '';
      if (k === 'agent') return hr?.assignedAgentName || (auth && mockAgents.find(a => a.id === auth.mainAgentId)?.name) || '';
      return (c[k] ?? '') + '';
    };

    return `
      <div class="bulk-update-card card">
        <div class="bulk-update-toolbar">
          <p class="bulk-update-hint"><i class="fas fa-info-circle"></i> Edit candidate data in the grid. Changes are saved to candidate profiles.</p>
          <button class="btn btn-primary" onclick="app.submitBulkUpdateCandidates('${jobId}', '${hrId}')"><i class="fas fa-save"></i> Save changes</button>
        </div>
        <div class="bulk-update-grid-wrap">
          <table class="bulk-update-table">
            <thead>
              <tr>
                ${cols.map(col => `<th class="bulk-update-th">${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${candidates.map(c => `
                <tr class="bulk-update-row" data-candidate-id="${c.id}">
                  ${cols.map(col => {
                    const val = getRowVal(c, col).replace(/"/g, '&quot;').replace(/</g, '&lt;');
                    const readonly = ['hiringRequest', 'projCode', 'projName'].includes(col.key) ? 'readonly' : '';
                    return `<td class="bulk-update-td"><input type="text" class="bulk-update-input" data-col="${col.key}" data-candidate-id="${c.id}" value="${val}" ${readonly}></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function submitBulkUpdateCandidates(jobId, hrId) {
    const rows = document.querySelectorAll('.bulk-update-row');
    rows.forEach(row => {
      const candidateId = row.dataset.candidateId;
      const c = mockCandidates.find(x => x.id === candidateId);
      if (!c) return;
      const inputs = row.querySelectorAll('.bulk-update-input');
      inputs.forEach(inp => {
        const col = inp.dataset.col;
        const val = (inp.value || '').trim();
        if (['hiringRequest', 'projCode', 'projName'].includes(col)) return;
        if (col === 'authorizationNumber' || col === 'issueDate') {
          const auth = (mockAgentAuthorizations || []).find(aa => aa.hiringRequestId === hrId);
          if (auth) {
            if (col === 'authorizationNumber') auth.code = val;
            else auth.issueDate = auth.authorizationDate = val;
          }
          return;
        }
        c[col] = val;
      });
    });
    showJobHr(jobId, hrId);
  }

  function initBulkStageHandlers(jobId, hrId) {
    const toolbar = document.querySelector('.bulk-stage-toolbar');
    if (toolbar?.dataset.initialized) return;
    if (toolbar) toolbar.dataset.initialized = '1';

    const selectAll = document.getElementById('bulkSelectAll');
    const checkboxes = document.querySelectorAll('.bulk-cand-cb');
    const countEl = document.getElementById('bulkSelectedCount');

    const updateCount = () => {
      const visibleCbs = document.querySelectorAll('.bulk-cand-row:not([style*="display: none"]) .bulk-cand-cb');
      const checkedVisible = document.querySelectorAll('.bulk-cand-row:not([style*="display: none"]) .bulk-cand-cb:checked');
      const totalChecked = document.querySelectorAll('.bulk-cand-cb:checked').length;
      if (countEl) countEl.textContent = totalChecked + ' selected';
      if (selectAll && visibleCbs.length > 0) selectAll.checked = checkedVisible.length === visibleCbs.length;
    };

    selectAll?.addEventListener('change', () => {
      document.querySelectorAll('.bulk-cand-row').forEach(row => {
        if (row.style.display !== 'none') {
          const cb = row.querySelector('.bulk-cand-cb');
          if (cb) cb.checked = selectAll.checked;
        }
      });
      updateCount();
    });

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateCount);
    });

    const searchInput = document.getElementById('bulkStageSearch');
    searchInput?.addEventListener('input', () => {
      const q = (searchInput.value || '').toLowerCase().trim();
      document.querySelectorAll('.bulk-cand-row').forEach(row => {
        const match = !q || (row.dataset.search || '').includes(q);
        row.style.display = match ? '' : 'none';
      });
      document.querySelectorAll('.stage-header-row').forEach(header => {
        const candRows = [];
        let sib = header.nextElementSibling;
        while (sib && sib.classList.contains('bulk-cand-row')) {
          candRows.push(sib);
          sib = sib.nextElementSibling;
        }
        const anyVisible = candRows.some(r => r.style.display !== 'none');
        header.style.display = anyVisible ? '' : 'none';
      });
      const visibleCheckboxes = document.querySelectorAll('.bulk-cand-row:not([style*="display: none"]) .bulk-cand-cb');
      if (selectAll) selectAll.checked = visibleCheckboxes.length > 0 && visibleCheckboxes.length === document.querySelectorAll('.bulk-cand-row:not([style*="display: none"]) .bulk-cand-cb:checked').length;
      updateCount();
    });

    updateCount();
  }

  function applyBulkStageChange(jobId, hrId) {
    const targetStage = document.getElementById('bulkTargetStage')?.value;
    if (!targetStage) return;
    const checked = document.querySelectorAll('.bulk-cand-cb:checked');
    if (checked.length === 0) {
      alert('Select at least one candidate.');
      return;
    }
    if (targetStage === 'Rejected') {
      const reason = prompt('Rejection reason (required for bulk reject):', 'Salary mismatch, Skills gap, Visa issues, Withdrawn, Other');
      if (!reason || !reason.trim()) return;
    }
    const hr = mockHiringRequests.find(h => h.id === hrId);
    checked.forEach(cb => {
      const candidateId = cb.dataset.candidateId;
      const currentStage = cb.dataset.currentStage;
      if (currentStage !== targetStage) {
        if (currentStage === 'Placed' && hr) hr.filled = Math.max(0, (hr.filled || 0) - 1);
        if (targetStage === 'Placed' && hr) hr.filled = (hr.filled || 0) + 1;
        moveCandidateStage(hrId, candidateId, currentStage, targetStage);
      }
    });
    showJobHr(jobId, hrId);
  }

  function buildAIRecommendationsContent(jobId, hrId, job, suggestions, hr) {
    const hasJobBrief = !!(job?.jobBrief || '').trim();
    const hasRequirements = job?.jobRequirements?.length > 0;
    const step1Complete = hasJobBrief && hasRequirements;

    return `
      <div class="ai-recs-intro card">
        <div class="ai-recs-icon"><i class="fas fa-robot"></i></div>
        <h3>AI Candidate Matching</h3>
        <p class="ai-recs-desc">Match candidates from your CV bank to this job using AI. Our engine analyzes job requirements, skills, experience, and salary expectations to surface the best-fit candidates. Complete the steps below and run a match to see ranked recommendations.</p>
      </div>

      <div class="ai-recs-steps card">
        <div class="card-title">Steps required</div>
        <div class="step-item ${step1Complete ? 'complete' : ''}">
          <span class="step-icon">${step1Complete ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-circle"></i>'}</span>
          <div>
            <strong>1. Complete job description</strong>
            <p class="step-detail">Add job brief, responsibilities, and requirements in the Summary tab for accurate matching.</p>
            <div class="step-checks">
              <span class="step-check ${hasJobBrief ? 'done' : ''}">${hasJobBrief ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'} Job brief</span>
              <span class="step-check ${hasRequirements ? 'done' : ''}">${hasRequirements ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'} Job requirements</span>
            </div>
          </div>
        </div>
        <div class="step-item">
          <span class="step-icon"><i class="fas fa-circle"></i></span>
          <div>
            <strong>2. Run AI matching</strong>
            <p class="step-detail">Search the CV bank and get ranked candidate recommendations.</p>
          </div>
        </div>
      </div>

      <div class="ai-recs-action">
        <button class="btn btn-primary btn-lg" onclick="app.runAIMatching('${jobId}', '${hrId}')" ${!step1Complete ? 'disabled' : ''}>
          <i class="fas fa-search"></i> Start matching from CV bank
        </button>
        ${!step1Complete ? '<p class="step-hint">Complete step 1 first to enable matching.</p>' : ''}
      </div>

    `;
  }

  function runAIMatching(jobId, hrId) {
    const container = document.getElementById('aiRecsContent');
    if (!container) return;

    container.innerHTML = `
      <div class="ai-recs-loader">
        <div class="loader-spinner"></div>
        <p class="loader-title">AI Matching in progress...</p>
        <div class="loader-steps">
          <div class="loader-step" id="loaderStep1">
            <span class="loader-step-icon"><i class="fas fa-spinner fa-spin"></i></span>
            <span>Verify job description</span>
          </div>
          <div class="loader-step" id="loaderStep2">
            <span class="loader-step-icon"><i class="far fa-circle"></i></span>
            <span>Find the matched candidates</span>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const step1 = document.getElementById('loaderStep1');
      const step2 = document.getElementById('loaderStep2');
      if (step1) {
        step1.querySelector('.loader-step-icon').innerHTML = '<i class="fas fa-check-circle"></i>';
        step1.classList.add('done');
      }
      if (step2) {
        step2.querySelector('.loader-step-icon').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        step2.classList.add('active');
      }
    }, 1000);

    setTimeout(() => {
      const hr = mockHiringRequests.find(h => h.id === hrId);
      const assignments = hr ? getHiringRequestAssignments(hr.id) : {};
      const suggestions = getVisibleCandidates().filter(c => !Object.values(assignments).flat().includes(c.id));
      const job = mockJobs.find(j => j.id === jobId);

      container.innerHTML = `
        <div class="ai-recs-results-header">
          <h3><i class="fas fa-users"></i> Matched candidates</h3>
          <p>${suggestions.length} candidate${suggestions.length !== 1 ? 's' : ''} matched from CV bank</p>
        </div>
        ${suggestions.length ? suggestions.slice(0, 10).map((c, i) => `
          <div class="match-card">
            <div class="match-score">${Math.max(70, 95 - i * 4)}%</div>
            <div class="match-info">
              <h4>${c.name}</h4>
              <p>${c.title} · ${c.experience} · ${skillNames(c)}</p>
            </div>
            ${hrId ? `<button class="btn btn-primary btn-sm" onclick="app.assignToHiringRequest('${hrId}','${c.id}'); app.showJobHr('${jobId}','${hrId}');">
              <i class="fas fa-plus"></i> Assign to hiring request
            </button>` : ''}
          </div>
        `).join('') : `
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No new matches found. All CV bank candidates may already be assigned to this job.</p>
            <button class="btn btn-secondary" onclick="app.runAIMatching('${jobId}','${hrId}')">Run again</button>
          </div>
        `}
      `;
    }, 2500);
  }

  function refreshAIRecsTab(jobId, hrId) {
    const job = mockJobs.find(j => j.id === jobId);
    const hr = mockHiringRequests.find(h => h.id === hrId);
    const assignments = hr ? getHiringRequestAssignments(hr.id) : {};
    const suggestions = getVisibleCandidates().filter(c => !Object.values(assignments).flat().includes(c.id));

    const container = document.getElementById('aiRecsContent');
    if (container) container.innerHTML = buildAIRecommendationsContent(jobId, hrId, job, suggestions, hr);
  }

  function initTabSwitcher() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (!tabName) return;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const content = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (content) content.classList.remove('hidden');
      });
    });
  }

  // --- JOB PROFILE with KANBAN (per Hiring Request) ---
  function renderJobProfile(jobId, selectedHrId) {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) return renderJobsList();
    if (!getVisibleJobIds().includes(jobId)) return renderJobsList();

    const hiringRequests = getJobHiringRequests(jobId).filter(hr => hrBelongsToCurrentAgent(hr));
    const jobTotals = getJobTotals(jobId);
    const hrId = selectedHrId || hiringRequests[0]?.id;
    const hr = mockHiringRequests.find(h => h.id === hrId);

    const assignments = hr ? getHiringRequestAssignments(hr.id) : {};
    const placedCount = (assignments['Placed'] || []).length;
    const pipelineCount = Object.entries(assignments).reduce((s, [k, arr]) => {
      if (k !== 'Placed' && k !== 'Rejected') return s + (arr?.length || 0);
      return s;
    }, 0);
    const droppedCount = (assignments['Rejected'] || []).length;
    const suggestions = getVisibleCandidates().filter(c => !Object.values(assignments).flat().includes(c.id));
    const jobActivities = mockActivities.filter(a => a.jobId === jobId);

    const stages = hr ? getStagesForHiringRequest(hr.id) : DEFAULT_STAGES;
    const kanbanHtml = stages.map(stage => {
      const candIds = assignments[stage] || [];
      const cards = candIds.map(cid => {
        const c = mockCandidates.find(x => x.id === cid);
        if (!c) return '';
        const kpi = getCandidateStageKpi(c.id, stage, job.id);
        const kpiClass = kpi ? ` kpi-${kpi.status}` : '';
        const kpiBadge = kpi ? `<span class="kanban-kpi-badge kpi-${kpi.status}">${kpi.label}</span>` : '';
        return `
          <div class="kanban-card${kpiClass}" data-candidate-id="${c.id}" data-stage="${stage}" draggable="true">
            <div class="kanban-card-header">
              <div class="kanban-card-avatar">${c.avatar}</div>
              <span class="kanban-card-name">${c.name}</span>
            </div>
            <div class="kanban-card-title">${c.title} @ ${(skillNames(c).split(', ')[0] || '-')} ${kpiBadge}</div>
            <div class="kanban-card-actions">
              <button title="View CV"><i class="fas fa-file"></i></button>
              <button title="View" onclick="event.stopPropagation(); app.showCandidate('${c.id}'); return false;"><i class="fas fa-eye"></i></button>
              <button title="Stage log" onclick="event.stopPropagation(); app.openCandidateStageLogs('${hrId}','${c.id}'); return false;"><i class="fas fa-stream"></i></button>
              <button title="More"><i class="fas fa-ellipsis-v"></i></button>
            </div>
          </div>
        `;
      }).join('');

      const targetDays = (typeof STAGE_TARGET_DAYS !== 'undefined') ? STAGE_TARGET_DAYS[stage] : null;
      const targetLabel = targetDays != null ? `Target ${targetDays} days` : 'No target';

      return `
        <div class="kanban-column" data-stage="${stage}">
          <div class="kanban-column-header">
            <div class="kanban-column-title">
              <span>${stage}</span>
              <small class="kanban-stage-subtitle">${targetLabel}</small>
            </div>
            <span class="count">${candIds.length}</span>
          </div>
          <div class="kanban-cards" data-stage="${stage}">${cards}</div>
        </div>
      `;
    }).join('');

    const hrSelectorHtml = hiringRequests.length ? `
      <div class="hiring-requests-bar">
        <label>Hiring Request:</label>
        <div class="hr-tabs">
          ${hiringRequests.map(h => `
            <button class="hr-tab ${h.id === hrId ? 'active' : ''}" onclick="app.showJobHr('${jobId}', '${h.id}')">
              <span class="hr-number">${h.number}</span>
              <span class="hr-meta">${h.assignedAgentName} · ${h.filled}/${h.required}</span>
            </button>
          `).join('')}
          ${isAdmin() ? `<button class="btn btn-secondary btn-sm" onclick="app.openEditHiringRequest('${hrId}')" title="Edit current hiring request"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="app.openAddHiringRequest('${jobId}')"><i class="fas fa-plus"></i> Add</button>` : ''}
        </div>
      </div>
    ` : `
      <div class="hiring-requests-bar">
        <p class="empty-state" style="margin:0;">${isAdmin() ? 'No hiring requests yet.' : 'No hiring requests assigned to your agent.'}</p>
        ${isAdmin() ? `<button class="btn btn-primary btn-sm" onclick="app.openAddHiringRequest('${jobId}')"><i class="fas fa-plus"></i> Add Hiring Request</button>` : ''}
      </div>
    `;

    render(`
      <a class="back-link" onclick="app.showView('jobs')"><i class="fas fa-arrow-left"></i> Back to Jobs</a>
      <div class="job-header">
        <div class="job-header-top">
          <div>
            <div class="job-title-row">
              <div class="job-logo">${job.clientName?.charAt(0) || 'J'}</div>
              <div>
                <h1 class="job-title">${job.title}</h1>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                  <span class="badge badge-inactive">NOT PUBLISHED</span>
                  <span class="badge badge-filled">PLACED</span>
                  <span class="avatar" style="width:24px;height:24px;font-size:0.7rem;">${job.ownerAvatar}</span> ${job.owner}
                </div>
              </div>
            </div>
            <div class="job-meta">
              <span><i class="fas fa-building"></i> ${job.clientName}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
              <span><i class="fas fa-money-bill"></i> ${job.salary}</span>
              <span class="badge badge-active">${job.status}</span>
              <span class="badge badge-high">${job.priority} Priority</span>
            </div>
          </div>
          <div class="funnel-stats">
            <span class="funnel-stat hired">Hired: ${jobTotals.filled}</span>
            <span class="funnel-stat pipeline">In pipeline: ${hiringRequests.reduce((s,h)=>{
              const a = getHiringRequestAssignments(h.id);
              return s + Object.entries(a).reduce((n,[k,arr])=> k!=='Placed'&&k!=='Rejected' ? n+(arr?.length||0) : n, 0);
            },0)}</span>
            <span class="funnel-stat dropped">Dropped: ${hiringRequests.reduce((s,h)=>(s+(getHiringRequestAssignments(h.id)['Rejected']||[]).length),0)}</span>
          </div>
        </div>
      </div>
      ${hrSelectorHtml}
      <div class="tabs job-profile-tabs">
        <button class="tab active" data-tab="candidates"><span>Candidates</span><span class="count">${placedCount + pipelineCount}</span></button>
        <button class="tab" data-tab="bulkstage">Bulk Stage</button>
        <button class="tab" data-tab="bulkupdate">Bulk Update</button>
        <button class="tab" data-tab="summary">Summary</button>
        <button class="tab" data-tab="team">Team</button>
        <button class="tab" data-tab="airecs">AI Recommendations</button>
        <button class="tab" data-tab="activities">Activities</button>
        <button class="tab" data-tab="attachments">Attachments</button>
      </div>
      <div class="job-tab-content" data-tab="candidates">${hr ? `<div class="kanban" id="kanbanBoard">${kanbanHtml}</div>` : '<p class="empty-state">Add a hiring request to manage candidates.</p>'}</div>
      <div class="job-tab-content hidden" data-tab="bulkstage" data-job-id="${jobId}" data-hr-id="${hr?.id || ''}">${hr ? buildBulkStageHtml(jobId, hr.id, assignments) : '<p class="empty-state">Add a hiring request to manage candidates.</p>'}</div>
      <div class="job-tab-content hidden" data-tab="bulkupdate" data-job-id="${jobId}" data-hr-id="${hr?.id || ''}">${hr ? buildBulkUpdateHtml(jobId, hr.id) : '<p class="empty-state">Add a hiring request to manage candidates.</p>'}</div>
      <div class="job-tab-content hidden" data-tab="summary" data-job-id="${jobId}">
        <div class="summary-grid" id="summaryView">
          <div class="card summary-description">
            <div class="summary-card-header">
              <span class="card-title">Job Description</span>
              <button class="btn btn-secondary btn-sm" onclick="app.editJobSummary('${jobId}')"><i class="fas fa-pen"></i> Edit</button>
            </div>
            ${job.jobBrief ? `
              <div class="job-brief">
                <h4>Job Brief</h4>
                <p>${job.jobBrief}</p>
              </div>
            ` : '<p class="empty-hint">No job description added yet.</p>'}
            ${job.responsibilities && job.responsibilities.length ? `
              <div class="job-responsibilities">
                <h4>Responsibilities</h4>
                <ul>${job.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>
              </div>
            ` : ''}
          </div>
          <div class="summary-sidebar">
            <div class="card">
              <div class="card-title">Job Requirements</div>
              ${job.jobRequirements && job.jobRequirements.length ? `
                <ul class="job-requirements-list">${job.jobRequirements.map(r => `<li>${r}</li>`).join('')}</ul>
              ` : '<p class="empty-hint">Job requirements are empty.</p>'}
            </div>
            <div class="card">
              <div class="card-title">Job Details</div>
              <dl class="job-details-dl">
                <dt>Job Reference</dt><dd>${job.jobReference || '—'}</dd>
                <dt>Position Name</dt><dd>${job.title}</dd>
                <dt>Client</dt><dd>${job.clientName}</dd>
                <dt>Job Location</dt><dd>${job.location || '—'}</dd>
                <dt>Remote</dt><dd>${job.remote ? 'Yes' : 'No'}</dd>
                <dt>Headcount</dt><dd>${job.headcount ?? jobTotals.required}</dd>
                <dt>Experience Level</dt><dd>${job.experienceLevel || '—'}</dd>
                <dt>Contract Type</dt><dd>${job.contractType || '—'}</dd>
                <dt>Minimum Salary</dt><dd>${job.minSalary ? job.minSalary + ' ' + (job.currency || 'SAR') : '—'}</dd>
                <dt>Maximum Salary</dt><dd>${job.maxSalary ? job.maxSalary + ' ' + (job.currency || 'SAR') : '—'}</dd>
                <dt>Frequency</dt><dd>${job.frequency || '—'}</dd>
                <dt>Filled / Required</dt><dd>${jobTotals.filled} / ${jobTotals.required}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div class="job-tab-content hidden" data-tab="team">
        <div class="team-grid">
          <div class="card team-card">
            <div class="card-title">Job Owner</div>
            <div class="team-member clickable" onclick="app.showUserProfile('u1')" title="View profile">
              <span class="avatar team-avatar">${job.ownerAvatar}</span>
              <div class="team-member-info"><strong>${job.owner}</strong><span class="team-role">Owner</span></div>
              <i class="fas fa-chevron-right team-arrow"></i>
            </div>
          </div>
          <div class="card team-card">
            <div class="card-title">Hiring Request Assignments</div>
            <div class="team-members-list">
              ${hiringRequests.map(h => {
                const user = mockUsers.find(u => u.id === h.assignedAgentId);
                return `<div class="team-member clickable" onclick="app.showUserProfile('${h.assignedAgentId}')" title="View ${h.assignedAgentName}">
                  <span class="avatar team-avatar">${user?.avatar || h.assignedAgentName?.charAt(0)}</span>
                  <div class="team-member-info"><strong>${h.assignedAgentName}</strong><span class="team-meta">${h.number} · ${h.filled}/${h.required}</span></div>
                  <i class="fas fa-chevron-right team-arrow"></i></div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="job-tab-content hidden" data-tab="airecs" data-job-id="${jobId}" data-hr-id="${hr?.id || ''}" id="aiRecsContainer">
        <div id="aiRecsContent">
          ${buildAIRecommendationsContent(jobId, hr?.id, job, suggestions, hr)}
        </div>
      </div>
      <div class="job-tab-content hidden" data-tab="activities" data-job-id="${jobId}">
        <div class="activities-panel">
          ${jobActivities.length ? `
            <div class="activity-list">${jobActivities.map(a => `
              <div class="activity-item activity-${a.type}">
                <span class="activity-type-icon"><i class="fas fa-${a.type==='call'?'phone':a.type==='email'?'envelope':a.type==='interview'?'video':a.type==='meeting'?'users':a.type==='task'?'tasks':'sticky-note'}"></i></span>
                <div class="activity-body">
                  <strong>${a.title}</strong>
                  <span class="activity-meta">${a.date}${a.relatedTo ? ' · ' + a.relatedTo : ''} · ${a.user || 'Muhammad'}</span>
                </div>
              </div>
            `).join('')}</div>
          ` : `
            <div class="activities-empty">
              <i class="fas fa-calendar-plus"></i>
              <p>You have not scheduled any activities yet.</p>
              <p class="hint-text">Schedule calls, interviews, meetings, and more.</p>
            </div>
          `}
          <button class="btn btn-primary" onclick="app.openCreateActivity('${jobId}')"><i class="fas fa-plus"></i> Add activity</button>
        </div>
      </div>
      <div class="job-tab-content hidden" data-tab="attachments">
        <p class="empty-state">No attachments</p>
      </div>
    `);

    if (hr) initKanbanDragDrop(hr.id);
    initJobProfileTabs();
  }

  function initJobProfileTabs() {
    document.querySelectorAll('.job-profile-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (!tabName) return;
        document.querySelectorAll('.job-profile-tabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.job-tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const content = document.querySelector(`.job-tab-content[data-tab="${tabName}"]`);
        if (content) content.classList.remove('hidden');
        if (tabName === 'bulkstage') {
          const jobId = content?.dataset?.jobId;
          const hrId = content?.dataset?.hrId;
          if (jobId && hrId) initBulkStageHandlers(jobId, hrId);
        }
      });
    });
  }

  function initKanbanDragDrop(hrId) {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-cards');

    let draggedCard = null;
    let sourceStage = null;

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        sourceStage = card.dataset.stage;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.candidateId);
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
      });
    });

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedCard) return;
        const targetStage = col.dataset.stage;
        const candidateId = draggedCard.dataset.candidateId;
        if (targetStage === 'Rejected') {
          const reason = prompt('Rejection reason (required):', 'Salary mismatch, Skills gap, Visa issues, Withdrawn, Other');
          if (!reason || !reason.trim()) return;
        }
        const hr = mockHiringRequests.find(h => h.id === hrId);
        if (hr && sourceStage === 'Placed') hr.filled = Math.max(0, (hr.filled || 0) - 1);
        if (hr && targetStage === 'Placed') hr.filled = (hr.filled || 0) + 1;
        moveCandidateStage(hrId, candidateId, sourceStage, targetStage);
        app.showJobHr(hr?.jobId, hrId);
      });
    });
  }

  function moveCandidateStage(hrId, candidateId, fromStage, toStage) {
    const a = mockAssignments[hrId];
    if (!a) return;
    [fromStage, toStage].forEach(s => { if (!a[s]) a[s] = []; });
    const idx = (a[fromStage] || []).indexOf(candidateId);
    if (idx >= 0) a[fromStage].splice(idx, 1);
    if (!a[toStage].includes(candidateId)) a[toStage].push(candidateId);

    // Log activity: stage changed (current date/time)
    try {
      const hr = mockHiringRequests.find(h => h.id === hrId);
      const jobId = hr?.jobId;
      const c = mockCandidates.find(x => x.id === candidateId);
      const u = getCurrentUser();
      const now = new Date();
      const pad2 = (n) => String(n).padStart(2, '0');
      const isoDate = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
      const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
      const display = `${isoDate} ${time}`;
      const nextId = (mockActivities && mockActivities.length ? Math.max(...mockActivities.map(x => x.id || 0)) : 0) + 1;
      (mockActivities || (window.mockActivities = [])).unshift({
        id: nextId,
        type: 'stage',
        subtype: 'stageChange',
        title: `${(c?.name || 'Candidate')} moved from ${fromStage} to ${toStage}`,
        jobId,
        candidateId,
        relatedTo: c?.name || '',
        date: display,
        scheduledDate: isoDate,
        status: 'done',
        assigneeId: u?.id || null,
        user: u?.name || ''
      });
    } catch (e) {}
  }

  // --- CANDIDATES LIST ---
  function renderCandidatesList() {
    const natFilter = document.getElementById('candFilterNationality')?.value || '';
    const filtered = getVisibleCandidates().filter(c => !natFilter || c.nationality === natFilter);
    render(`
      <div class="page-header">
        <h1 class="page-title">Candidates</h1>
        <button class="btn btn-primary" onclick="app.openCreateCandidate()"><i class="fas fa-plus"></i> Add Candidate</button>
      </div>
      <div class="card filters-bar" style="margin-bottom:1rem;">
        <select id="candFilterNationality" onchange="app.showView('candidates')"><option value="">All Nationalities</option><option value="Philippines" ${natFilter==='Philippines'?'selected':''}>Philippines</option><option value="Egypt" ${natFilter==='Egypt'?'selected':''}>Egypt</option></select>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Title</th><th>Nationality</th><th>Experience</th><th>Skills</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${filtered.map(c => `
                <tr>
                  <td><div class="kanban-card-header" style="margin:0;"><span class="kanban-card-avatar" style="width:28px;height:28px;font-size:0.7rem;">${c.avatar}</span> <strong>${c.name}</strong></div></td>
                  <td>${c.title}</td>
                  <td>${c.nationality}</td>
                  <td>${c.experience}</td>
                  <td>${skillNames(c)}</td>
                  <td><span class="badge badge-active">${c.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="app.showCandidate('${c.id}')">View</button>
                    <button class="btn btn-primary btn-sm" onclick="app.openAssignToHr('${c.id}')" title="Assign to hiring request"><i class="fas fa-briefcase"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  // --- CANDIDATE PROFILE ---
  function renderCandidateProfile(candidateId) {
    const c = mockCandidates.find(x => x.id === candidateId);
    if (!c) return renderCandidatesList();
    if (!isAdmin() && c.agentId !== getCurrentUser()?.agentId) {
      alert('You can only view candidates that belong to your agent.');
      return renderCandidatesList();
    }

    const assignedHrs = mockHiringRequests.filter(hr => {
      const a = mockAssignments[hr.id] || {};
      return Object.values(a).flat().includes(candidateId);
    });
    const assignedJobsWithStage = assignedHrs.map(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      const a = mockAssignments[hr.id] || {};
      const stage = Object.entries(a).find(([s, arr]) => arr?.includes(candidateId))?.[0] || '-';
      return { job, hr, stage };
    });
    const history = (typeof mockCandidateHistory !== 'undefined' && mockCandidateHistory[candidateId]) || [];
    const skills = c.skills || [];
    const skillsList = Array.isArray(skills) ? skills : [];
    const hasSkillsWithRating = skillsList.length && typeof skillsList[0] === 'object' && skillsList[0].name;

    const tabCount = (label, count) => (count > 0 ? `<span class="tab-count">${count}</span>` : '');

    render(`
      <a class="back-link" onclick="app.showView('candidates')"><i class="fas fa-arrow-left"></i> Back to Candidates</a>
      <div class="cand-profile-header">
        <div class="cand-profile-header-top">
          <div class="kanban-card-avatar cand-profile-avatar">${c.avatar}</div>
          <div class="cand-profile-info">
            <h1 class="cand-profile-name">${c.name}</h1>
            <p class="cand-profile-role">${(c.currentPosition || c.title).toUpperCase()}${c.currentCompany ? ', ' + c.currentCompany.toUpperCase() : ''}</p>
            ${c.location ? `<p class="cand-profile-location"><i class="fas fa-map-marker-alt"></i> ${c.location}</p>` : ''}
            <div class="cand-profile-tags">
              ${(c.tags || []).map(t => `<span class="cand-tag">${t}</span>`).join('')}
              <button class="cand-tag-add">+ Tags</button>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openAssignToHr('${candidateId}')" title="Assign to hiring request"><i class="fas fa-briefcase"></i> Assign to HR</button>
          <button class="btn-icon-primary cand-profile-add"><i class="fas fa-plus"></i></button>
        </div>
        <div class="cand-profile-tabs">
          <button class="tab active" data-tab="summary">Summary</button>
          <button class="tab" data-tab="resume">Resume ${tabCount('Resume', c.resumeCount || 0)}</button>
          <button class="tab" data-tab="inbox">Inbox ${tabCount('Inbox', c.inboxCount || 0)}</button>
          <button class="tab" data-tab="social">Social</button>
          <button class="tab" data-tab="jobs">Jobs ${tabCount('Jobs', c.jobsCount || assignedJobsWithStage.length || 0)}</button>
          <button class="tab" data-tab="recommendation">Recommendation</button>
          <button class="tab" data-tab="activities">Activities</button>
          <button class="tab" data-tab="notes">Notes</button>
          <button class="tab" data-tab="attachments">Attachments</button>
          <button class="tab" data-tab="history">History</button>
        </div>
      </div>

      <div class="cand-tab-content" data-tab="summary">
        <div class="cand-summary-grid">
          <div class="cand-summary-left">
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Candidate Details</span><button class="toggle-edit">Edit</button></div>
              <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">Agent</span><span class="detail-value">${(typeof mockAgents !== 'undefined' && mockAgents.find(a => a.id === c.agentId)?.name) || c.agentId || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Name</span><span class="detail-value">${c.name}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate First Name</span><span class="detail-value">${c.firstName || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Last Name</span><span class="detail-value">${c.lastName || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Reference</span><span class="detail-value">${c.reference || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Gender</span><span class="detail-value">${c.gender || 'None'}</span></div>
                <div class="detail-item"><span class="detail-label">Diploma</span><span class="detail-value">${c.diploma || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">University</span><span class="detail-value">${c.university || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Current Company</span><span class="detail-value">${c.currentCompany || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Current Position</span><span class="detail-value">${c.currentPosition || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Location</span><span class="detail-value">${c.location || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Birthdate</span><span class="detail-value">${c.birthdate ? c.birthdate : '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Address</span><span class="detail-value">${c.address || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Email Address</span><span class="detail-value">${c.email ? `<span>${c.email}</span> <i class="fas fa-envelope contact-icon"></i> <i class="fas fa-comment contact-icon"></i>` : '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Phone Number</span><span class="detail-value">${c.phone ? `<span>${c.phone}</span> <i class="fas fa-whatsapp contact-icon"></i>` : '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Other Contact</span><span class="detail-value"><a href="#">+ Add</a></span></div>
              </div>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Skills</span><button class="btn-icon-sm"><i class="fas fa-plus"></i></button></div>
              <div class="skill-tags">
                ${hasSkillsWithRating ? skillsList.map(s => `<span class="skill-tag">${s.rating} ${s.name}</span>`).join('') : (Array.isArray(skillsList) ? skillsList.map(s => typeof s === 'string' ? `<span class="skill-tag">${s}</span>` : `<span class="skill-tag">${s.rating} ${s.name}</span>`).join('') : '')}
              </div>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Additional Information</span><button class="btn-icon-sm"><i class="fas fa-plus"></i></button></div>
              <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">Current Department</span><span class="detail-value">${c.department || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Candidate Industry</span><span class="detail-value">${c.industry || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Years of Experience</span><span class="detail-value">${c.experienceYears != null ? c.experienceYears + ' yrs' : 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Graduation Date</span><span class="detail-value">${c.graduationDate || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Current Salary</span><span class="detail-value">${c.currentSalary || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Current Benefits</span><span class="detail-value"><a href="#">+ Add</a></span></div>
                <div class="detail-item"><span class="detail-label">Notice Period</span><span class="detail-value">${c.noticePeriod || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Expected Salary</span><span class="detail-value">${c.expectedSalary || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Expected Benefits</span><span class="detail-value"><a href="#">+ Add</a></span></div>
                <div class="detail-item"><span class="detail-label">Nationalities</span><span class="detail-value">${(c.nationalities || []).length ? c.nationalities.join(', ') : '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Languages</span><span class="detail-value">${(c.languages || []).length ? c.languages.join(', ') : '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">GDPR Consent</span><span class="detail-value">${c.gdprConsent || 'Pending'}</span></div>
                <div class="detail-item"><span class="detail-label">Email Consent</span><span class="detail-value">${c.emailConsent || 'Pending'}</span></div>
              </div>
            </div>
            ${c.employmentStatus ? `
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Employee Details</span><button class="toggle-edit">Edit</button></div>
              <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">Employment Status</span><span class="detail-value">${c.employmentStatus}</span></div>
                <div class="detail-item"><span class="detail-label">Hired Date</span><span class="detail-value">${c.hiredDate || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Start Date</span><span class="detail-value">${c.startDate || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Probation End Date</span><span class="detail-value">${c.probationEndDate || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Left Date</span><span class="detail-value">${c.leftDate || '<a href="#">+ Add</a>'}</span></div>
                <div class="detail-item"><span class="detail-label">Employee Job</span><span class="detail-value">${c.employeeJob || '-'}</span></div>
                <div class="detail-item"><span class="detail-label">Client</span><span class="detail-value">${c.employeeClient || '-'}</span></div>
              </div>
            </div>
            ` : ''}
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Experience</span><button class="btn-icon-sm"><i class="fas fa-plus"></i></button></div>
              <select class="source-filter"><option>All</option></select>
              <div class="exp-list">
                ${(c.experience || []).length ? (Array.isArray(c.experience) && typeof c.experience[0] === 'object' ? c.experience.map(ex => `
                  <div class="exp-item">
                    <div class="exp-role">${ex.role || ex.title}</div>
                    <div class="exp-company">${ex.company}</div>
                    <div class="exp-dates">${ex.start} – ${ex.end}${ex.years ? ' - ' + ex.years : ''}</div>
                    <div class="exp-country">${ex.country || ''}</div>
                    <button class="btn-icon-sm exp-menu"><i class="fas fa-ellipsis-v"></i></button>
                  </div>
                `).join('') : '') : '<p class="empty-state">No experience added</p>'}
              </div>
            </div>
            <div class="card cand-section">
              <div class="card-title">Log Book</div>
              <p class="empty-state">No entries yet</p>
            </div>
          </div>
          <div class="cand-summary-right">
            <div class="card cand-section">
              <div class="card-title">Candidate Summary</div>
              <p class="text-muted"><strong>Created date:</strong> ${c.createdDate || '-'}</p>
              <p class="text-muted"><strong>Created by:</strong> ${c.createdBy || '-'}</p>
              <p class="text-muted"><strong>Last updated:</strong> ${c.lastUpdated ? c.lastUpdated + ' (9 days ago)' : '-'}</p>
            </div>
            <div class="card cand-section">
              <div class="card-title">Recent History</div>
              <div class="history-timeline">
                ${history.length ? history.map(h => `
                  <div class="history-item">
                    <span class="history-avatar">${h.userAvatar || h.user[0]}</span>
                    <div>
                      <span class="history-user">${h.user}</span> ${h.action}
                      <div class="history-date">${h.date}</div>
                    </div>
                  </div>
                `).join('') : '<p class="empty-state">No history</p>'}
              </div>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Recent Notes</span><button class="btn-add">+ Add</button></div>
              <p class="empty-state">No notes added yet</p>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Addresses</span><button class="btn-add">+ Add</button></div>
              <p class="empty-state">No addresses added yet</p>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Education</span><button class="btn-icon-sm"><i class="fas fa-plus"></i></button></div>
              <div class="edu-list">
                ${(c.education || []).length ? (Array.isArray(c.education) && c.education[0] && typeof c.education[0] === 'object' ? c.education.map(ed => `
                  <div class="edu-item">
                    <i class="fas fa-book"></i>
                    <div>
                      <div class="edu-institution">${ed.institution}</div>
                      <div class="edu-degree">${ed.degree || ''}</div>
                      <div class="edu-dates">${ed.start} - ${ed.end} · ${ed.country || ''}</div>
                    </div>
                    <button class="btn-icon-sm exp-menu"><i class="fas fa-ellipsis-v"></i></button>
                  </div>
                `).join('') : '') : '<p class="empty-state">No education added</p>'}
              </div>
            </div>
            <div class="card cand-section">
              <div class="card-title-row"><span class="card-title">Jobs</span><button class="btn-icon-sm"><i class="fas fa-plus"></i></button></div>
              ${assignedJobsWithStage.length ? assignedJobsWithStage.map(({ job, hr, stage }) => `
                <div class="cand-job-item">
                  <i class="fas fa-briefcase"></i>
                  <div>
                    <div class="cand-job-title">${job.title}</div>
                    <div class="cand-job-client">${job.client}</div>
                    <span class="badge badge-placed">${stage.toUpperCase()}</span>
                  </div>
                </div>
              `).join('') : '<p class="empty-state">No jobs assigned</p>'}
            </div>
          </div>
        </div>
      </div>

      <div class="cand-tab-content hidden" data-tab="resume">
        <div class="card"><p class="empty-state">Resume content (${c.resumeCount || 0} item(s))</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="inbox">
        <div class="card"><p class="empty-state">Inbox messages (${c.inboxCount || 0})</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="social">
        <div class="card"><p class="empty-state">Social profiles</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="jobs">
        <div class="card">
          <div class="card-title">Assigned Jobs</div>
          ${assignedJobsWithStage.length ? assignedJobsWithStage.map(({ job, hr, stage }) =>
            `<div class="assigned-job-row"><a onclick="app.showJobHr('${job.id}','${hr.id}')">${job.title}</a> — ${hr.number} · ${hr.assignedAgentName} <span class="badge badge-active">${stage}</span></div>`
          ).join('') : '<p class="empty-state">No jobs assigned</p>'}
        </div>
      </div>
      <div class="cand-tab-content hidden" data-tab="recommendation">
        <div class="card"><p class="empty-state">Recommendations</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="activities">
        <div class="card"><p class="empty-state">Activities</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="notes">
        <div class="card"><p class="empty-state">Notes</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="attachments">
        <div class="card"><p class="empty-state">No documents uploaded</p></div>
      </div>
      <div class="cand-tab-content hidden" data-tab="history">
        <div class="card"><div class="card-title">History</div><p class="empty-state">Full history</p></div>
      </div>
    `);
    initCandProfileTabs();
  }

  function initCandProfileTabs() {
    document.querySelectorAll('.cand-profile-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (!tabName) return;
        document.querySelectorAll('.cand-profile-tabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.cand-tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const content = document.querySelector(`.cand-tab-content[data-tab="${tabName}"]`);
        if (content) content.classList.remove('hidden');
      });
    });
  }

  // --- CVs ---
  function renderCVs() {
    const list = getVisibleCVs();
    const natOptions = (mockNationalities || []).map(n => n.name).join(', ');
    render(`
      <div class="page-header">
        <h1 class="page-title">CVs</h1>
        <button class="btn btn-primary" onclick="app.openUploadCV()"><i class="fas fa-upload"></i> Upload CV</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>File</th><th>Uploaded</th><th>Status</th><th>Candidate</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.map(cv => {
                const cand = cv.candidateId ? mockCandidates.find(c => c.id === cv.candidateId) : null;
                return `
                <tr>
                  <td><i class="fas fa-file-pdf" style="color:var(--danger);margin-right:0.5rem;"></i>${cv.fileName}</td>
                  <td>${cv.uploadDate}</td>
                  <td><span class="badge badge-${cv.status === 'converted' ? 'filled' : 'inactive'}">${cv.status === 'converted' ? 'Converted' : 'Pending'}</span></td>
                  <td>${cand ? `<a href="#" class="lookup-link" onclick="app.showCandidate('${cand.id}'); return false;">${cand.name}</a>` : '-'}</td>
                  <td>
                    ${cv.status === 'not_converted' ? `<button class="btn btn-primary btn-sm" onclick="app.openConvertCvToCandidate('${cv.id}')"><i class="fas fa-user-plus"></i> Convert to Candidate</button>` : ''}
                    ${cv.status === 'converted' ? `<button class="btn btn-secondary btn-sm" onclick="app.showCandidate('${cv.candidateId}')">View Candidate</button>` : ''}
                  </td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${list.length === 0 ? '<p class="empty-state">No CVs uploaded yet. Upload a CV to convert it to a candidate.</p>' : ''}
      </div>
    `);
  }

  function openUploadCV() {
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Upload CV</div>
      <div class="modal-body">
        <p class="text-muted" style="margin-bottom:1rem;">Upload a CV file (PDF, DOC, DOCX). After upload, convert it to a candidate using <strong>AI Parse</strong> or <strong>manual entry</strong>.</p>
        <div class="form-group">
          <label>Choose file <span class="required">*</span></label>
          <input type="file" id="cvFile" accept=".pdf,.doc,.docx" style="font-size:0.85rem" required>
          <small class="text-muted">Accepted: PDF, DOC, DOCX</small>
        </div>
        <div class="form-group">
          <label>File name (auto-filled or override)</label>
          <input type="text" id="cvFileName" placeholder="e.g. John_Doe_RN.pdf" readonly>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitUploadCV()"><i class="fas fa-upload"></i> Upload</button>
      </div>
    `;
    document.getElementById('cvFile')?.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      const nameEl = document.getElementById('cvFileName');
      if (f && nameEl) {
        nameEl.value = f.name;
        nameEl.removeAttribute('readonly');
      }
    });
  }

  function submitUploadCV() {
    const fileInput = document.getElementById('cvFile');
    let fileName = (fileInput?.files?.[0]?.name || document.getElementById('cvFileName')?.value || '').trim();
    if (!fileName) return alert('Please choose a CV file to upload');
    const u = getCurrentUser();
    if (!u) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newCv = {
      id: 'cv' + (mockCVs.length + 1),
      fileName,
      uploadDate: now,
      status: 'not_converted',
      candidateId: null,
      uploadedByUserId: u.id
    };
    mockCVs.push(newCv);
    closeModal();
    renderCVs();
  }

  function openConvertCvToCandidate(cvId) {
    const cv = mockCVs.find(c => c.id === cvId);
    if (!cv || cv.status === 'converted') return;
    _convertCvId = cvId;
    setActiveNav('candidates');
    renderAddCandidateForm();
  }

  function getConvertCvPrefillData(cvId) {
    const cv = mockCVs.find(c => c.id === cvId);
    if (!cv) return null;
    const derived = (cv.fileName || '').replace(/\.(pdf|doc|docx)$/i, '').replace(/_/g, ' ');
    const parts = (derived || 'John Doe').split(' ').filter(Boolean);
    return {
      name: derived || 'John Doe',
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      title: 'Registered Nurse',
      nationality: 'Philippines',
      experience: '5 years',
      skills: 'ICU, Emergency care',
      currentCompany: 'Sample Hospital',
      currentPosition: 'Staff Nurse',
      university: 'University of the Philippines',
      diploma: 'Nursing'
    };
  }

  function prefillCandidateFormFromCv(cvId) {
    const data = getConvertCvPrefillData(cvId);
    if (!data) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('candName', data.name);
    set('candFirstName', data.firstName);
    set('candLastName', data.lastName);
    set('candTitle', data.title);
    set('candNationality', data.nationality);
    set('candExperience', data.experience);
    set('candSkills', data.skills);
    set('candCurrentCompany', data.currentCompany);
    set('candCurrentPosition', data.currentPosition);
    set('candUniversity', data.university);
    set('candDiploma', data.diploma);
  }

  function parseCvAi(cvId) {
    const cv = mockCVs.find(c => c.id === cvId);
    const derived = (cv?.fileName || '').replace(/\.(pdf|doc|docx)$/i, '').replace(/_/g, ' ');
    const candName = document.getElementById('candName');
    const candTitle = document.getElementById('candTitle');
    const candNationality = document.getElementById('candNationality');
    const candExperience = document.getElementById('candExperience');
    const candSkills = document.getElementById('candSkills');
    if (candName) candName.value = candName.value || (derived || 'John Doe');
    if (candTitle) candTitle.value = candTitle.value || 'Registered Nurse';
    if (candNationality) candNationality.value = candNationality.value || 'Philippines';
    if (candExperience) candExperience.value = candExperience.value || '5 years';
    if (candSkills) candSkills.value = candSkills.value || 'ICU, Emergency';
  }

  function submitConvertCvToCandidate(cvId) {
    const cv = mockCVs.find(c => c.id === cvId);
    if (!cv || cv.status === 'converted') return;
    const name = document.getElementById('candName')?.value?.trim();
    if (!name) return alert('Please enter candidate name');
    const avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const title = document.getElementById('candTitle')?.value || '-';
    const nationality = document.getElementById('candNationality')?.value || '-';
    const experience = document.getElementById('candExperience')?.value || '-';
    const skillsInput = (document.getElementById('candSkills')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const skills = skillsInput.map(s => (typeof s === 'string' ? { name: s, rating: 8 } : s));
    const selectedAgentId = (document.getElementById('candAgentId')?.value || '').trim();
    const agentId = isAdmin() ? (selectedAgentId || null) : (getCurrentUser()?.agentId || null);
    if (isAdmin() && !agentId) return alert('Please select an agent.');
    const newC = {
      id: 'ca' + (mockCandidates.length + 1),
      agentId,
      name: name.toUpperCase(),
      firstName: name.split(' ')[0] || '',
      lastName: name.split(' ').slice(1).join(' ') || '',
      title,
      nationality,
      experience,
      experienceYears: parseInt(experience) || 0,
      status: 'available',
      avatar,
      skills,
      tags: [],
      reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
      location: '', birthdate: '', address: '', email: '', phone: '',
      department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
      nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
      employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
      education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
    };
    mockCandidates.push(newC);
    cv.status = 'converted';
    cv.candidateId = newC.id;
    closeModal();
    renderCVs();
    showCandidate(newC.id);
    setTimeout(() => { if (getVisibleHiringRequests().length) openAssignToHr(newC.id); }, 100);
  }

  function openAssignToHr(candidateId) {
    const candidate = mockCandidates.find(c => c.id === candidateId);
    if (!candidate) return;
    if (!isAdmin() && candidate.agentId !== getCurrentUser()?.agentId) {
      alert('You can only manage candidates that belong to your agent.');
      return;
    }
    const visibleJobs = getVisibleJobs();
    const visibleHrs = getVisibleHiringRequests();
    if (!visibleHrs.length) return alert('No hiring requests available for your agent.');
    modalOverlay.classList.remove('hidden');
    const jobOptions = visibleJobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('');
    const firstJobId = visibleJobs[0]?.id;
    const hrsForJob = visibleHrs.filter(hr => hr.jobId === firstJobId);
    const hrOptions = hrsForJob.map(hr => `<option value="${hr.id}">${hr.number} - ${hr.assignedAgentName} (${hr.filled}/${hr.required})</option>`).join('');
    modalContent.innerHTML = `
      <div class="modal-header">Assign Candidate to Hiring Request</div>
      <div class="modal-body">
        <p class="text-muted" style="margin-bottom:1rem;">Select a job and hiring request to assign this candidate.</p>
        <div class="form-group">
          <label>Job</label>
          <select id="assignJobSelect" onchange="app.updateAssignHrOptions()">
            ${jobOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Hiring Request</label>
          <select id="assignHrSelect">
            ${hrOptions}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitAssignToHr('${candidateId}')"><i class="fas fa-plus"></i> Assign</button>
      </div>
    `;
  }

  function updateAssignHrOptions() {
    const jobId = document.getElementById('assignJobSelect')?.value;
    if (!jobId) return;
    const visibleHrs = getVisibleHiringRequests().filter(hr => hr.jobId === jobId);
    const sel = document.getElementById('assignHrSelect');
    if (!sel) return;
    sel.innerHTML = visibleHrs.map(hr => `<option value="${hr.id}">${hr.number} - ${hr.assignedAgentName} (${hr.filled}/${hr.required})</option>`).join('');
  }

  function submitAssignToHr(candidateId) {
    const hrId = document.getElementById('assignHrSelect')?.value;
    if (!hrId) return alert('Please select a hiring request');
    assignToHiringRequest(hrId, candidateId);
    closeModal();
    const hr = mockHiringRequests.find(h => h.id === hrId);
    if (hr) {
      renderJobProfile(hr.jobId, hr.id);
      showView('jobs');
    } else {
      renderCandidatesList();
      showView('candidates');
    }
  }

  // --- MATCHES (AI) ---
  function renderMatches(selectedJobId) {
    const visibleJobs = getVisibleJobs();
    const visibleHrs = getVisibleHiringRequests();
    const jobId = selectedJobId || visibleJobs[0]?.id;
    const job = mockJobs.find(j => j.id === jobId);
    if (!job || !visibleJobs.length) return render('<div class="empty-state">No jobs available for your agent</div>');
    const jobHrIds = visibleHrs.filter(hr => hr.jobId === jobId).map(hr => hr.id);
    const placedInJob = jobHrIds.flatMap(hrId => mockAssignments[hrId]?.['Placed'] || []);
    const suggestions = getVisibleCandidates().filter(c => !placedInJob.includes(c.id));
    render(`
      <div class="page-header">
        <h1 class="page-title">AI Matches</h1>
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <div class="form-group">
          <label>Select Job</label>
          <select id="matchJobSelect" onchange="app.renderMatchesView(this.value)">
            ${visibleJobs.map(j => `<option value="${j.id}" ${j.id===jobId?'selected':''}>${j.title}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Assign to Hiring Request</label>
          <select id="matchHrSelect">
            ${visibleHrs.filter(hr=>hr.jobId===jobId).map(hr=>`<option value="${hr.id}">${hr.number} - ${hr.assignedAgentName} (${hr.filled}/${hr.required})</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-title">Recommended Candidates</div>
      ${suggestions.length ? suggestions.map((c, i) => `
        <div class="match-card">
          <div class="match-score">${85 - i * 5}%</div>
          <div class="match-info">
            <h4>${c.name}</h4>
            <p>${c.title} - ${c.experience} - ${skillNames(c)}</p>
          </div>
          <button class="btn btn-primary" onclick="app.assignToHrFromMatches('${c.id}')">Assign to Hiring Request</button>
        </div>
      `).join('') : '<div class="empty-state"><i class="fas fa-check-circle"></i><p>All candidates assigned or no matches</p></div>'}
    `);
  }

  // --- PLACEMENTS ---
  function renderPlacements() {
    const placed = getVisibleHiringRequests().flatMap(hr => {
      const ids = mockAssignments[hr.id]?.['Placed'] || [];
      const job = mockJobs.find(j => j.id === hr.jobId);
      return ids.map(cid => {
        const c = mockCandidates.find(x => x.id === cid);
        return c && job ? { candidate: c, job, hr } : null;
      }).filter(Boolean);
    });

    render(`
      <div class="page-header">
        <h1 class="page-title">Placements</h1>
        <button class="btn btn-secondary"><i class="fas fa-download"></i> Export</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Candidate</th><th>Job</th><th>Client</th><th>Deployment Date</th><th>Visa Status</th><th>Contract Expiry</th></tr>
            </thead>
            <tbody>
              ${placed.length ? placed.map(p => `
                <tr>
                  <td>${p.candidate.name}</td>
                  <td>${p.job.title} (${p.hr?.number || ''})</td>
                  <td>${p.job.clientName}</td>
                  <td>—</td>
                  <td><span class="badge badge-active">In Progress</span></td>
                  <td>—</td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="empty-state">No placements yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  // --- CLIENTS ---
  function renderClients(clientId) {
    if (clientId) return renderClientProfile(clientId);
    const clients = mockClients.map(cl => {
      const clientJobs = mockJobs.filter(j => j.clientId === cl.id);
      const activeJobs = clientJobs.filter(j => j.status === 'active').length;
      const firstJob = clientJobs[0];
      const owner = firstJob?.owner || 'Muhammad';
      const ownerAvatar = firstJob?.ownerAvatar || (owner || 'M')[0];
      const location = cl.location || (firstJob?.location ? firstJob.location.split(',')[0].trim() + ', KSA' : 'KSA');
      const isHealthcare = (cl.industry || '').toLowerCase().includes('health') || (cl.name || '').toLowerCase().includes('hospital') || (cl.name || '').toLowerCase().includes('medical');
      const iconClass = isHealthcare ? 'fa-stethoscope' : 'fa-hard-hat';
      return { ...cl, activeJobs, owner, ownerAvatar, location, iconClass };
    });
    render(`
      <div class="clients-page">
        <div class="clients-header">
          <h1 class="clients-title">CLIENTS</h1>
          <span class="clients-total-badge">${clients.length} TOTAL</span>
          <button class="btn btn-primary" onclick="app.openCreateClient()" style="margin-left:auto;"><i class="fas fa-plus"></i> Add Client</button>
        </div>
        <div class="clients-card-grid">
          ${clients.map(cl => `
            <div class="client-card">
              <div class="client-card-icon"><i class="fas ${cl.iconClass}"></i></div>
              <span class="client-card-status">CLIENT ONBOARDED</span>
              <h3 class="client-card-name">${cl.name}</h3>
              <div class="client-card-details">
                <div class="client-card-detail"><i class="fas fa-map-marker-alt"></i> ${cl.location}</div>
                <div class="client-card-detail"><i class="fas fa-building"></i> ${cl.industry || '-'}</div>
              </div>
              <div class="client-card-footer">
                <div class="client-card-owner">
                  <span class="client-card-label">OWNER</span>
                  <div class="client-owner-row">
                    <span class="client-owner-avatar">${cl.ownerAvatar}</span>
                    <span class="client-owner-name">${cl.owner}</span>
                  </div>
                </div>
                <div class="client-card-jobs">
                  <span class="client-card-label">ACTIVE JOBS</span>
                  <span class="client-jobs-count">${cl.activeJobs}</span>
                </div>
              </div>
              <a href="#" class="client-card-link" onclick="app.showClient('${cl.id}'); return false;">VIEW CLIENT JOBS →</a>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  // --- CLIENT PROFILE ---
  function renderClientProfile(clientId) {
    const cl = mockClients.find(c => c.id === clientId);
    if (!cl) return renderClients();
    const clientJobs = mockJobs.filter(j => j.clientId === clientId);
    render(`
      <a class="back-link" onclick="app.showView('clients')"><i class="fas fa-arrow-left"></i> Back to Clients</a>
      <div class="job-header">
        <div class="job-title-row">
          <div class="job-logo">${cl.logo || cl.name.charAt(0)}</div>
          <div>
            <h1 class="job-title">${cl.name}</h1>
            <span class="badge badge-active">${cl.status}</span>
            <span class="badge badge-filled">${cl.industry}</span>
          </div>
        </div>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="summary">Summary</button>
        <button class="tab" data-tab="jobs">Jobs (${clientJobs.length})</button>
      </div>
      <div class="card tab-content" data-tab="summary">
        <div class="card-title">Client Details</div>
        <p><strong>Industry:</strong> ${cl.industry}</p>
        <p><strong>Status:</strong> ${cl.status}</p>
        <p><strong>Active Jobs:</strong> ${clientJobs.length}</p>
      </div>
      <div class="card tab-content hidden" data-tab="jobs" style="margin-top:1rem;">
        <div class="card-title">Jobs</div>
        ${clientJobs.length ? clientJobs.map(j => `
          <p><a class="back-link" style="margin:0;" onclick="app.showJob('${j.id}')">${j.title}</a> — ${(getJobTotals(j.id).filled)}/${(getJobTotals(j.id).required)} filled</p>
        `).join('') : '<p class="empty-state">No jobs yet</p>'}
      </div>
    `);
    initTabSwitcher();
  }

  // --- ACTIVITIES (standalone page) ---
  const ACTIVITY_STATUSES = ['scheduled', 'done', 'missed', 'cancelled'];
  const currentUserId = 'u1';

  function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
  }
  let activitiesActiveTab = 'next';

  function parseDateOnly(d) {
    if (!d) return null;
    // supports 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'
    const parts = d.split(' ')[0].split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(day)) return null;
    return new Date(y, m, day);
  }

  function diffInDays(d1, d2) {
    if (!d1 || !d2) return null;
    const ms = d2.getTime() - d1.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  // Compute KPI for a given stage-change activity based on previous stage-change for same candidate
  function getStageActivityKpi(activity) {
    if (!activity || activity.type !== 'stage' || activity.subtype !== 'stageChange') return null;
    if (typeof STAGE_TARGET_DAYS === 'undefined') return null;
    const fromStageMatch = /moved from\s+(.+)\s+to\s+/.exec((activity.title || '').toLowerCase());
    const fromStageLabel = fromStageMatch ? fromStageMatch[1] : null;
    const fromStage = fromStageLabel
      ? Object.keys(STAGE_TARGET_DAYS).find(s => s.toLowerCase() === fromStageLabel)
      : null;
    if (!fromStage) return null;
    const targetDays = STAGE_TARGET_DAYS[fromStage];
    if (targetDays == null) return null;
    const allStageLogs = (mockActivities || []).filter(a =>
      a.type === 'stage' &&
      a.subtype === 'stageChange' &&
      a.candidateId === activity.candidateId
    ).sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));
    const idx = allStageLogs.findIndex(a => a.id === activity.id);
    if (idx <= 0) return null;
    const prev = allStageLogs[idx - 1];
    const prevDate = parseDateOnly(prev.scheduledDate);
    const currDate = parseDateOnly(activity.scheduledDate);
    const days = diffInDays(prevDate, currDate);
    if (days == null) return null;
    if (days > targetDays) return { status: 'late', label: 'Late', days, targetDays };
    if (days < targetDays) return { status: 'excellent', label: 'Excellent', days, targetDays };
    return { status: 'normal', label: 'On time', days, targetDays };
  }

  // KPI for candidate card: how many days the candidate has stayed in the CURRENT stage vs that stage's target
  function getCandidateStageKpi(candidateId, stage, jobId) {
    if (typeof STAGE_TARGET_DAYS === 'undefined') return null;
    const targetDays = STAGE_TARGET_DAYS[stage];
    if (targetDays == null) return null;

    // Find last time candidate ENTERED this stage in this job
    const logs = (mockActivities || []).filter(a =>
      a.type === 'stage' &&
      a.subtype === 'stageChange' &&
      a.candidateId === candidateId &&
      a.jobId === jobId &&
      (a.title || '').endsWith(`to ${stage}`)
    ).sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));
    if (!logs.length) return null;
    const lastEnter = logs[logs.length - 1];
    const enterDate = parseDateOnly(lastEnter.scheduledDate);
    const todayDate = parseDateOnly(getTodayDateString());
    const days = diffInDays(enterDate, todayDate);
    if (days == null) return null;
    if (days >= targetDays) return { status: 'late', label: 'Late', days, targetDays };
    return { status: 'normal', label: 'On track', days, targetDays };
  }

  function getActivityIcon(type) {
    const map = { call: 'phone', email: 'envelope', interview: 'video', meeting: 'users', task: 'tasks', stage: 'arrow-right' };
    return map[type] || 'sticky-note';
  }

  function filterActivities(tab) {
    if (tab === 'hiringStages') {
      return [...mockActivities]
        .filter(a => a.type === 'stage' && a.subtype === 'stageChange')
        .sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));
    }
    if (tab === 'next') {
      const todayStr = getTodayDateString();
      return mockActivities
        .filter(a => (a.assigneeId || 'u1') === currentUserId && (a.status || 'scheduled') === 'scheduled' && (a.scheduledDate || '') >= todayStr)
        .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));
    }
    if (tab === 'recent') {
      const todayStr = getTodayDateString();
      return mockActivities
        .filter(a => (a.scheduledDate || '9999') < todayStr || ['done', 'missed'].includes(a.status || ''))
        .sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));
    }
    return [...mockActivities].sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));
  }

  function buildActivityCard(a) {
    const job = mockJobs.find(j => j.id === a.jobId);
    const status = a.status || 'scheduled';
    const isStageChange = a.type === 'stage' && a.subtype === 'stageChange';
    const isHiringStagesTab = activitiesActiveTab === 'hiringStages';
    const canEditDateTime = isStageChange && isHiringStagesTab && isAdmin();

    const kpi = isStageChange ? getStageActivityKpi(a) : null;

    let dateContent;
    if (canEditDateTime) {
      // Expect a.date like "YYYY-MM-DD HH:MM:SS"
      let value = '';
      if (a.date && /^\d{4}-\d{2}-\d{2}/.test(a.date)) {
        const parts = a.date.split(' ');
        const d = parts[0];
        const t = (parts[1] || '').substring(0, 5);
        value = `${d}T${t}`;
      } else if (a.scheduledDate) {
        value = `${a.scheduledDate}T00:00`;
      }
      dateContent = `
        <label class="activity-date-edit-label">
          <span>Date &amp; time</span>
          <input type="datetime-local" class="activity-datetime-input" value="${value}" onchange="app.updateStageActivityDate(${a.id}, this.value)">
        </label>
      `;
    } else {
      dateContent = a.date;
    }

    const kpiTag = kpi ? `<span class="activity-kpi-tag kpi-${kpi.status}">${kpi.label}</span>` : '';

    return `
      <div class="activity-card" data-id="${a.id}">
        <span class="activity-card-icon"><i class="fas fa-${getActivityIcon(a.type)}"></i></span>
        <div class="activity-card-body">
          <strong>${a.title} ${kpiTag}</strong>
          <span class="activity-card-meta">${dateContent}${a.relatedTo ? ' · ' + a.relatedTo : ''}${job ? ' · ' + job.title : ''}</span>
        </div>
        <div class="activity-card-actions">
          <select class="activity-status-select" onchange="app.updateActivityStatus(${a.id}, this.value)">
            ${ACTIVITY_STATUSES.map(s => `<option value="${s}" ${s===status?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  }

  function updateActivityStatus(activityId, status) {
    const a = mockActivities.find(x => x.id === activityId);
    if (a) a.status = status;
    const activeBtn = document.querySelector('.activities-tab.active');
    renderActivitiesPage(activeBtn?.dataset?.tab || 'next');
  }

  function renderActivitiesPage(activeTab) {
    const tab = activeTab || 'next';
    activitiesActiveTab = tab;
    const list = filterActivities(tab);
    const container = document.getElementById('activitiesTabContent');
    if (!container) return;
    container.innerHTML = list.length ? list.map(buildActivityCard).join('') : '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No activities in this view.</p></div>';
  }

  function renderActivities() {
    render(`
      <div class="page-header">
        <h1 class="page-title">Activities</h1>
        <button class="btn btn-primary" onclick="app.openCreateActivityFromPage()"><i class="fas fa-plus"></i> Add activity</button>
      </div>
      <div class="activities-page-tabs">
        <button class="activities-tab active" data-tab="next" id="activitiesTabNext">My next activities</button>
        <button class="activities-tab" data-tab="all">All activities</button>
        <button class="activities-tab" data-tab="recent">Recent activities</button>
        <button class="activities-tab" data-tab="hiringStages">Hiring Stages</button>
      </div>
      <div class="card activities-list-card">
        <div id="activitiesTabContent" class="activities-list-wrap"></div>
      </div>
    `);

    document.querySelectorAll('.activities-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.activities-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderActivitiesPage(btn.dataset.tab);
      });
    });

    renderActivitiesPage('next');
  }

  function updateStageActivityDate(activityId, value) {
    if (!isAdmin()) return;
    if (!value) return;
    const a = mockActivities.find(x => x.id === activityId && x.type === 'stage' && x.subtype === 'stageChange');
    if (!a) return;
    // value is like "YYYY-MM-DDTHH:MM"
    const [d, t] = value.split('T');
    if (!d) return;
    const time = (t && t.length >= 5) ? t.substring(0, 5) : '00:00';
    a.scheduledDate = d;
    a.date = `${d} ${time}:00`;
    renderActivitiesPage(activitiesActiveTab || 'next');
  }

  function openCandidateStageLogs(hrId, candidateId) {
    const hr = mockHiringRequests.find(h => h.id === hrId);
    const job = hr ? mockJobs.find(j => j.id === hr.jobId) : null;
    const candidate = mockCandidates.find(c => c.id === candidateId);
    const logs = (mockActivities || []).filter(a =>
      a.type === 'stage' &&
      a.subtype === 'stageChange' &&
      a.candidateId === candidateId &&
      (!job || a.jobId === job.id)
    ).sort((a, b) => (b.scheduledDate || '').localeCompare(a.scheduledDate || ''));

    const items = logs.length ? logs.map(a => {
      const kpi = getStageActivityKpi(a);
      const kpiBadge = kpi ? `<span class="activity-kpi-tag kpi-${kpi.status}">${kpi.label}</span>` : '';
      return `
        <div class="activity-card">
          <div class="activity-card-body">
            <strong>${a.title} ${kpiBadge}</strong>
            <span class="activity-card-meta">${a.date}</span>
          </div>
        </div>
      `;
    }).join('') : '<p class="empty-state">No stage changes logged yet for this candidate.</p>';

    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Hiring stage log - ${candidate?.name || ''}</div>
      <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
        <p class="page-subtitle" style="margin-bottom:1rem;">
          ${job ? `Job: <strong>${job.title}</strong>` : ''}${hr ? ` · HR: <strong>${hr.number}</strong>` : ''}
        </p>
        ${items}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      </div>
    `;
  }

  function openDashboardStageDetails(stage) {
    const { filteredHrs } = getDashboardFilteredHrsAndJobs();
    const rows = [];
    filteredHrs.forEach(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      if (!job) return;
      const assignments = getHiringRequestAssignments(hr.id);
      (assignments[stage] || []).forEach(cid => {
        const c = mockCandidates.find(x => x.id === cid);
        if (!c) return;
        const kpi = getCandidateStageKpi(c.id, stage, job.id);
        rows.push({
          agent: hr.assignedAgentName || '',
          client: job.clientName || '',
          hrNumber: hr.number || hr.id,
          candidate: c.name || '',
          kpi
        });
      });
    });

    const body = rows.length ? `
      <table class="dashboard-stage-details-table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Client</th>
            <th>Hiring Request</th>
            <th>Candidate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.agent}</td>
              <td>${r.client}</td>
              <td>${r.hrNumber}</td>
              <td>${r.candidate}</td>
              <td>${r.kpi ? `<span class="activity-kpi-tag kpi-${r.kpi.status}">${r.kpi.label}</span>` : '<span class="kpi-label">N/A</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p class="empty-state">No candidates in this stage for the current filters.</p>';

    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Stage details - ${stage}</div>
      <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
        ${body}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      </div>
    `;
  }

  function renderAgentPerformanceCharts(data) {
    const { hrJobEntries, perfOnTrack, perfLate, actExcellent, actNormal, actLate } = data;

    // Destroy old charts to avoid leaks
    [agentHrChart, agentStageChart, agentActChart].forEach(ch => {
      try { ch && ch.destroy(); } catch (e) {}
    });

    const hrCtx = document.getElementById('agentHrPie')?.getContext?.('2d');
    if (hrCtx && hrJobEntries.length) {
      agentHrChart = new Chart(hrCtx, {
        type: 'pie',
        data: {
          labels: hrJobEntries.map(e => e.jobTitle),
          datasets: [{
            data: hrJobEntries.map(e => e.count),
            backgroundColor: ['#0ea5e9','#22c55e','#eab308','#f97316','#6366f1','#ec4899']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    const stageCtx = document.getElementById('agentStageBar')?.getContext?.('2d');
    if (stageCtx && (perfOnTrack + perfLate) > 0) {
      agentStageChart = new Chart(stageCtx, {
        type: 'bar',
        data: {
          labels: ['On track', 'Late'],
          datasets: [{
            data: [perfOnTrack, perfLate],
            backgroundColor: ['#2563eb', '#dc2626']
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, precision: 0 }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    const actCtx = document.getElementById('agentActPie')?.getContext?.('2d');
    if (actCtx && (actExcellent + actNormal + actLate) > 0) {
      agentActChart = new Chart(actCtx, {
        type: 'doughnut',
        data: {
          labels: ['Excellent', 'On time', 'Late'],
          datasets: [{
            data: [actExcellent, actNormal, actLate],
            backgroundColor: ['#16a34a','#2563eb','#dc2626']
          }]
        },
        options: {
          cutout: '60%',
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  function openCreateActivityFromPage() {
    const jobId = mockJobs[0]?.id;
    if (jobId) openCreateActivity(jobId);
    else alert('No jobs available. Create a job first.');
  }

  // --- INBOX ---
  function renderInbox() {
    render(`
      <div class="page-header">
        <h1 class="page-title">Inbox</h1>
      </div>
      <div class="card">
        <div class="inbox-list">
          ${mockInbox.map(m => `
            <div class="inbox-item ${m.unread ? 'unread' : ''}">
              <div class="inbox-from">${m.from}</div>
              <div class="inbox-subject">${m.subject}</div>
              <div class="inbox-preview">${m.preview}</div>
              <div class="inbox-date">${m.date}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  // --- AI CENTER ---
  function renderAICenter() {
    render(`
      <div class="page-header">
        <h1 class="page-title">AI Center</h1>
      </div>
      <div class="ai-center-grid">
        <div class="card ai-tool">
          <div class="ai-tool-icon"><i class="fas fa-file-alt"></i></div>
          <div class="card-title">AI Job Writer</div>
          <p>Generate, improve, or translate job descriptions.</p>
          <button class="btn btn-primary btn-sm">Generate Description</button>
        </div>
        <div class="card ai-tool">
          <div class="ai-tool-icon"><i class="fas fa-file-import"></i></div>
          <div class="card-title">AI CV Parser</div>
          <p>Upload CV and extract structured fields automatically.</p>
          <button class="btn btn-primary btn-sm">Upload CV</button>
        </div>
        <div class="card ai-tool">
          <div class="ai-tool-icon"><i class="fas fa-sliders-h"></i></div>
          <div class="card-title">AI Match Engine</div>
          <p>Configure match weights for candidate-job matching.</p>
          <div class="form-group" style="margin-top:0.5rem;">
            <label>Skills weight: 40%</label>
            <input type="range" min="0" max="100" value="40">
          </div>
          <div class="form-group">
            <label>Experience weight: 35%</label>
            <input type="range" min="0" max="100" value="35">
          </div>
          <div class="form-group">
            <label>Salary weight: 25%</label>
            <input type="range" min="0" max="100" value="25">
          </div>
        </div>
      </div>
    `);
  }

  // --- SOURCING HUB ---
  function renderSourcing() {
    render(`
      <div class="page-header">
        <h1 class="page-title">Sourcing Hub</h1>
      </div>
      <div class="card">
        <div class="card-title">External Sourcing</div>
        <p>Connect external sources to import candidates (Phase 2).</p>
        <div class="empty-state" style="padding:2rem;">
          <i class="fas fa-globe"></i>
          <p>LinkedIn Search, Job Boards integration coming soon.</p>
        </div>
      </div>
    `);
  }

  // --- USERS (admin only) ---
  function renderUsers() {
    if (!isAdmin()) return showView('dashboard');
    const list = mockUsers.map(u => {
      const agent = mockAgents.find(a => a.id === u.agentId);
      return { ...u, agentName: agent?.name || '-' };
    });
    render(`
      <div class="page-header">
        <h1 class="page-title">Users</h1>
        <button class="btn btn-primary" onclick="app.openAddUser()"><i class="fas fa-plus"></i> Add User</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Agent</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.map(u => `
                <tr>
                  <td><span class="avatar" style="width:28px;height:28px;font-size:0.8rem;">${u.avatar}</span> ${u.name}</td>
                  <td>${u.email}</td>
                  <td><span class="badge badge-${u.role}">${(u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1)}</span></td>
                  <td>${u.agentName}</td>
                  <td><button class="btn btn-secondary btn-sm" onclick="app.openEditUser('${u.id}')">Edit</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  function openAddUser() {
    if (!isAdmin()) return;
    const agentOptions = mockAgents.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Add User</div>
      <div class="modal-body">
        <div class="form-group"><label>Name <span class="required">*</span></label><input type="text" id="userName" placeholder="Full name"></div>
        <div class="form-group"><label>Email <span class="required">*</span></label><input type="email" id="userEmail" placeholder="email@test.com"></div>
        <div class="form-group"><label>Password <span class="required">*</span></label><input type="password" id="userPassword" placeholder="••••••••"></div>
        <div class="form-group"><label>Role <span class="required">*</span></label>
          <select id="userRole" onchange="document.getElementById('userAgentWrap').style.display=this.value==='agent'?'block':'none'">
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
        </div>
        <div class="form-group" id="userAgentWrap" style="display:none">
          <label>Agent (for agent users)</label>
          <select id="userAgentId">
            <option value="">-- Select Agent --</option>
            ${agentOptions}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitAddUser()">Add</button>
      </div>
    `;
  }

  function submitAddUser() {
    const name = document.getElementById('userName')?.value?.trim();
    const email = document.getElementById('userEmail')?.value?.trim();
    const password = document.getElementById('userPassword')?.value;
    const role = document.getElementById('userRole')?.value || 'agent';
    const agentId = role === 'agent' ? (document.getElementById('userAgentId')?.value || null) : null;
    if (!name || !email || !password) return alert('Please fill required fields');
    if (mockUsers.some(u => (u.email || '').toLowerCase() === email.toLowerCase())) return alert('Email already exists');
    const newUser = {
      id: 'u' + (mockUsers.length + 1),
      name,
      email,
      password,
      role,
      agentId: role === 'agent' ? agentId : null,
      avatar: name.charAt(0).toUpperCase(),
      password
    };
    mockUsers.push(newUser);
    closeModal();
    renderUsers();
  }

  function openEditUser(id) {
    if (!isAdmin()) return;
    const u = mockUsers.find(x => x.id === id);
    if (!u) return;
    const agentOptions = mockAgents.map(a => `<option value="${a.id}" ${u.agentId === a.id ? 'selected' : ''}>${a.name}</option>`).join('');
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Edit User</div>
      <div class="modal-body">
        <div class="form-group"><label>Name <span class="required">*</span></label><input type="text" id="userName" value="${(u.name || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Email <span class="required">*</span></label><input type="email" id="userEmail" value="${(u.email || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Password</label><input type="password" id="userPassword" placeholder="Leave blank to keep current"></div>
        <div class="form-group"><label>Role <span class="required">*</span></label>
          <select id="userRole" onchange="document.getElementById('userAgentWrap').style.display=this.value==='agent'?'block':'none'">
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="agent" ${u.role === 'agent' ? 'selected' : ''}>Agent</option>
          </select>
        </div>
        <div class="form-group" id="userAgentWrap" style="display:${u.role === 'agent' ? 'block' : 'none'}">
          <label>Agent (for agent users)</label>
          <select id="userAgentId">
            <option value="">-- Select Agent --</option>
            ${agentOptions}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitEditUser('${id}')">Save</button>
      </div>
    `;
  }

  function submitEditUser(id) {
    const u = mockUsers.find(x => x.id === id);
    if (!u) return;
    const name = document.getElementById('userName')?.value?.trim();
    const email = document.getElementById('userEmail')?.value?.trim();
    const password = document.getElementById('userPassword')?.value;
    const role = document.getElementById('userRole')?.value || 'agent';
    const agentId = role === 'agent' ? (document.getElementById('userAgentId')?.value || null) : null;
    if (!name || !email) return alert('Please fill required fields');
    if (mockUsers.some(x => x.id !== id && (x.email || '').toLowerCase() === email.toLowerCase())) return alert('Email already exists');
    u.name = name;
    u.email = email;
    if (password) u.password = password;
    u.role = role;
    u.agentId = role === 'agent' ? agentId : null;
    u.avatar = name.charAt(0).toUpperCase();
    closeModal();
    renderUsers();
    updateHeaderUser();
  }

  // --- AGENTS (admin only) ---
  function renderAgents() {
    if (!isAdmin()) return showView('dashboard');
    const list = mockAgents.map(a => ({
      ...a,
      userCount: mockUsers.filter(u => u.agentId === a.id).length
    }));
    render(`
      <div class="page-header">
        <h1 class="page-title">Agents</h1>
        <button class="btn btn-primary" onclick="app.openAddAgent()"><i class="fas fa-plus"></i> Add Agent</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Code</th><th>Name</th><th>Agent Users</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.map(a => `
                <tr>
                  <td><a href="#" class="lookup-link" onclick="app.showAgent('${a.id}'); return false;"><strong>${a.code || '-'}</strong></a></td>
                  <td><a href="#" class="lookup-link" onclick="app.showAgent('${a.id}'); return false;">${a.name}</a></td>
                  <td>${a.userCount}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="app.showAgent('${a.id}')"><i class="fas fa-folder-open"></i> Open</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  function getAgentCountryOptions(selected) {
    const list = typeof mockCountries !== 'undefined' ? mockCountries : [];
    return '<option value="">— Select country —</option>' + list.map(c => `<option value="${(c.name || '').replace(/"/g, '&quot;')}" ${(selected || '') === (c.name || '') ? 'selected' : ''}>${c.name || ''}</option>`).join('');
  }

  function getAgentCityOptions(countryName, selectedCity) {
    if (!countryName || typeof mockCitiesByCountry === 'undefined') return '<option value="">— Select city —</option>';
    const cities = mockCitiesByCountry[countryName] || [];
    return '<option value="">— Select city —</option>' + cities.map(c => `<option value="${(c || '').replace(/"/g, '&quot;')}" ${(selectedCity || '') === (c || '') ? 'selected' : ''}>${c || ''}</option>`).join('');
  }

  function updateAgentCityDropdown(selectedCity) {
    const countrySel = document.getElementById('agentCountry');
    const citySel = document.getElementById('agentCity');
    if (!countrySel || !citySel) return;
    const country = (countrySel.value || '').trim();
    citySel.innerHTML = getAgentCityOptions(country, selectedCity);
  }

  function openAddAgent() {
    if (!isAdmin()) return;
    const countryOpts = getAgentCountryOptions('');
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Add Agent</div>
      <div class="modal-body">
        <div class="form-group"><label>Code <span class="required">*</span></label><input type="text" id="agentCode" placeholder="e.g. TAS"></div>
        <div class="form-group"><label>Agent Name (AR) <span class="required">*</span></label><input type="text" id="agentName" placeholder="e.g. TRANS ASIA INTEGRATE SERVICES"></div>
        <div class="form-group"><label>Agent Name (EN)</label><input type="text" id="agentNameEn" placeholder="English name"></div>
        <div class="form-group"><label>Agent License No</label><input type="text" id="agentLicenseNo" placeholder="License number"></div>
        <div class="form-group"><label>Office Official Name</label><input type="text" id="officeOfficialName" placeholder="Office official name"></div>
        <div class="form-group"><label>Agent Type</label>
          <select id="agentType">
            <option value="External" selected>External</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
        <div class="form-group"><label>Country</label><select id="agentCountry" onchange="app.updateAgentCityDropdown()">${countryOpts}</select></div>
        <div class="form-group"><label>City</label><select id="agentCity">${getAgentCityOptions('', '')}</select></div>
        <div class="form-group"><label>Supplier Site</label><input type="text" id="agentSupplierSite"></div>
        <div class="form-group"><label>Phone</label><input type="text" id="agentPhone"></div>
        <div class="form-group"><label>Street Name</label><input type="text" id="agentStreetName"></div>
        <div class="form-group"><label>P.O Box</label><input type="text" id="agentPoBox"></div>
        <div class="form-group"><label>Fax</label><input type="text" id="agentFax"></div>
        <div class="form-group"><label>Building/Office Number</label><input type="text" id="agentBuildingNumber"></div>
        <div class="form-group"><label>Office Space (sqm)</label><input type="number" id="agentOfficeSpaceSqm" min="0" step="1"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitAddAgent()">Add</button>
      </div>
    `;
  }

  function submitAddAgent() {
    const code = document.getElementById('agentCode')?.value?.trim();
    const name = document.getElementById('agentName')?.value?.trim();
    const nameEn = document.getElementById('agentNameEn')?.value?.trim() || '';
    const licenseNo = document.getElementById('agentLicenseNo')?.value?.trim() || '';
    const officeOfficialName = document.getElementById('officeOfficialName')?.value?.trim() || '';
    const agentType = document.getElementById('agentType')?.value || 'External';
    const country = document.getElementById('agentCountry')?.value?.trim() || '';
    const city = document.getElementById('agentCity')?.value?.trim() || '';
    const supplierSite = document.getElementById('agentSupplierSite')?.value?.trim() || '';
    const phone = document.getElementById('agentPhone')?.value?.trim() || '';
    const streetName = document.getElementById('agentStreetName')?.value?.trim() || '';
    const poBox = document.getElementById('agentPoBox')?.value?.trim() || '';
    const fax = document.getElementById('agentFax')?.value?.trim() || '';
    const buildingNumber = document.getElementById('agentBuildingNumber')?.value?.trim() || '';
    const officeSpaceSqm = document.getElementById('agentOfficeSpaceSqm')?.value?.trim() || '';
    if (!code || !name) return alert('Please fill required fields');
    mockAgents.push({
      id: 'ag' + (mockAgents.length + 1),
      code,
      name,
      nameEn,
      licenseNo,
      officeOfficialName,
      agentType,
      country,
      city,
      supplierSite,
      phone,
      streetName,
      poBox,
      fax,
      buildingNumber,
      officeSpaceSqm
    });
    closeModal();
    renderAgents();
  }

  function openEditAgent(id) {
    if (!isAdmin()) return;
    const a = mockAgents.find(x => x.id === id);
    if (!a) return;
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Edit Agent</div>
      <div class="modal-body">
        <div class="form-group"><label>Code <span class="required">*</span></label><input type="text" id="agentCode" value="${(a.code || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Agent Name (AR) <span class="required">*</span></label><input type="text" id="agentName" value="${(a.name || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Agent Name (EN)</label><input type="text" id="agentNameEn" value="${(a.nameEn || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Agent License No</label><input type="text" id="agentLicenseNo" value="${(a.licenseNo || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Office Official Name</label><input type="text" id="officeOfficialName" value="${(a.officeOfficialName || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Agent Type</label>
          <select id="agentType">
            <option value="External" ${a.agentType === 'External' ? 'selected' : ''}>External</option>
            <option value="Internal" ${a.agentType === 'Internal' ? 'selected' : ''}>Internal</option>
          </select>
        </div>
        <div class="form-group"><label>Country</label><select id="agentCountry" onchange="app.updateAgentCityDropdown()">${getAgentCountryOptions(a.country || '')}</select></div>
        <div class="form-group"><label>City</label><select id="agentCity">${getAgentCityOptions(a.country || '', a.city || '')}</select></div>
        <div class="form-group"><label>Supplier Site</label><input type="text" id="agentSupplierSite" value="${(a.supplierSite || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Phone</label><input type="text" id="agentPhone" value="${(a.phone || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Street Name</label><input type="text" id="agentStreetName" value="${(a.streetName || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>P.O Box</label><input type="text" id="agentPoBox" value="${(a.poBox || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Fax</label><input type="text" id="agentFax" value="${(a.fax || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Building/Office Number</label><input type="text" id="agentBuildingNumber" value="${(a.buildingNumber || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Office Space (sqm)</label><input type="number" id="agentOfficeSpaceSqm" min="0" step="1" value="${(a.officeSpaceSqm || '')}"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitEditAgent('${id}')">Save</button>
      </div>
    `;
  }

  function submitEditAgent(id) {
    const a = mockAgents.find(x => x.id === id);
    if (!a) return;
    const code = document.getElementById('agentCode')?.value?.trim();
    const name = document.getElementById('agentName')?.value?.trim();
    const nameEn = document.getElementById('agentNameEn')?.value?.trim() || '';
    const licenseNo = document.getElementById('agentLicenseNo')?.value?.trim() || '';
    const officeOfficialName = document.getElementById('officeOfficialName')?.value?.trim() || '';
    const agentType = document.getElementById('agentType')?.value || 'External';
    const country = document.getElementById('agentCountry')?.value?.trim() || '';
    const city = document.getElementById('agentCity')?.value?.trim() || '';
    const supplierSite = document.getElementById('agentSupplierSite')?.value?.trim() || '';
    const phone = document.getElementById('agentPhone')?.value?.trim() || '';
    const streetName = document.getElementById('agentStreetName')?.value?.trim() || '';
    const poBox = document.getElementById('agentPoBox')?.value?.trim() || '';
    const fax = document.getElementById('agentFax')?.value?.trim() || '';
    const buildingNumber = document.getElementById('agentBuildingNumber')?.value?.trim() || '';
    const officeSpaceSqm = document.getElementById('agentOfficeSpaceSqm')?.value?.trim() || '';
    if (!code || !name) return alert('Please fill required fields');
    Object.assign(a, {
      code,
      name,
      nameEn,
      licenseNo,
      officeOfficialName,
      agentType,
      country,
      city,
      supplierSite,
      phone,
      streetName,
      poBox,
      fax,
      buildingNumber,
      officeSpaceSqm
    });
    closeModal();
    renderAgents();
  }

  function getCandidateAssignedJobAndStage(candidateId) {
    for (const hrId of Object.keys(mockAssignments)) {
      const a = mockAssignments[hrId];
      if (!a) continue;
      for (const [stage, arr] of Object.entries(a)) {
        if (Array.isArray(arr) && arr.includes(candidateId)) {
          const hr = mockHiringRequests.find(h => h.id === hrId);
          const job = hr ? mockJobs.find(j => j.id === hr.jobId) : null;
          return { job: job?.title || '-', stage };
        }
      }
    }
    return { job: '-', stage: '-' };
  }

  function renderAgentProfile(agentId) {
    const a = mockAgents.find(x => x.id === agentId);
    if (!a) return renderAgents();
    if (!isAdmin() && getCurrentUser()?.agentId !== agentId) return showView('dashboard');
    const agentUsers = mockUsers.filter(u => u.agentId === agentId);
    const nameDisplay = (a.name || '').replace(/"/g, '&quot;');
    const codeDisplay = (a.code || '').replace(/"/g, '&quot;');
    const nameEnDisplay = (a.nameEn || '').replace(/"/g, '&quot;');
    const licenseDisplay = (a.licenseNo || '').replace(/"/g, '&quot;');
    const officeOfficialDisplay = (a.officeOfficialName || '').replace(/"/g, '&quot;');
    const typeDisplay = a.agentType || 'External';
    const countryDisplay = (a.country || '').replace(/"/g, '&quot;');
    const cityDisplay = (a.city || '').replace(/"/g, '&quot;');
    const supplierSiteDisplay = (a.supplierSite || '').replace(/"/g, '&quot;');
    const phoneDisplay = (a.phone || '').replace(/"/g, '&quot;');
    const streetDisplay = (a.streetName || '').replace(/"/g, '&quot;');
    const poBoxDisplay = (a.poBox || '').replace(/"/g, '&quot;');
    const faxDisplay = (a.fax || '').replace(/"/g, '&quot;');
    const buildingDisplay = (a.buildingNumber || '').replace(/"/g, '&quot;');
    const officeSpaceDisplay = (a.officeSpaceSqm || '').toString().replace(/"/g, '&quot;');
    setActiveNav('agents');
    render(`
      <div class="auth-edit-page agent-profile-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('agents')"><i class="fas fa-arrow-left"></i> Agents</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${codeDisplay} - ${nameDisplay}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Agent: ${codeDisplay}</h1>
          <p class="auth-edit-subtitle">${nameDisplay}</p>
        </div>
        <div class="agent-profile-tabs" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;border-bottom:1px solid var(--border-color, #e0e0e0);padding-bottom:0.5rem;">
          <button type="button" class="tab active" data-tab="details"><i class="fas fa-building"></i> Details</button>
          <button type="button" class="tab" data-tab="users"><i class="fas fa-users"></i> Users (${agentUsers.length})</button>
          <button type="button" class="tab" data-tab="candidates"><i class="fas fa-user-friends"></i> Candidates</button>
          <button type="button" class="tab" data-tab="hiringRequests"><i class="fas fa-briefcase"></i> Hiring Requests</button>
          <button type="button" class="tab" data-tab="authorizations"><i class="fas fa-file-signature"></i> Authorizations</button>
          <button type="button" class="tab" data-tab="activities"><i class="fas fa-stream"></i> Recent Activities</button>
        </div>
        <form class="auth-edit-form" onsubmit="app.submitEditAgentInPage('${agentId}'); return false;">
          <div class="auth-edit-body">
            <div class="agent-tab-content" data-tab="details">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-building"></i> Agent details</h3>
              <div class="auth-form-grid">
                <div class="form-group">
                  <label for="agentCode">Code <span class="required">*</span></label>
                  <input type="text" id="agentCode" value="${codeDisplay}" placeholder="e.g. TAS">
                </div>
                <div class="form-group form-group-full">
                  <label for="agentName">Agent Name (AR) <span class="required">*</span></label>
                  <input type="text" id="agentName" value="${nameDisplay}" placeholder="Arabic name">
                </div>
                <div class="form-group form-group-full">
                  <label for="agentNameEn">Agent Name (EN)</label>
                  <input type="text" id="agentNameEn" value="${nameEnDisplay}" placeholder="English name">
                </div>
                <div class="form-group">
                  <label for="agentLicenseNo">Agent License No</label>
                  <input type="text" id="agentLicenseNo" value="${licenseDisplay}">
                </div>
                <div class="form-group form-group-full">
                  <label for="officeOfficialName">Office Official Name</label>
                  <input type="text" id="officeOfficialName" value="${officeOfficialDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentType">Agent Type</label>
                  <select id="agentType">
                    <option value="External" ${typeDisplay === 'External' ? 'selected' : ''}>External</option>
                    <option value="Internal" ${typeDisplay === 'Internal' ? 'selected' : ''}>Internal</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="agentCountry">Country</label>
                  <select id="agentCountry" onchange="app.updateAgentCityDropdown()">${getAgentCountryOptions(countryDisplay)}</select>
                </div>
                <div class="form-group">
                  <label for="agentCity">City</label>
                  <select id="agentCity">${getAgentCityOptions(countryDisplay, cityDisplay)}</select>
                </div>
                <div class="form-group">
                  <label for="agentSupplierSite">Supplier Site</label>
                  <input type="text" id="agentSupplierSite" value="${supplierSiteDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentPhone">Phone</label>
                  <input type="text" id="agentPhone" value="${phoneDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentStreetName">Street Name</label>
                  <input type="text" id="agentStreetName" value="${streetDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentPoBox">P.O Box</label>
                  <input type="text" id="agentPoBox" value="${poBoxDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentFax">Fax</label>
                  <input type="text" id="agentFax" value="${faxDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentBuildingNumber">Building/Office Number</label>
                  <input type="text" id="agentBuildingNumber" value="${buildingDisplay}">
                </div>
                <div class="form-group">
                  <label for="agentOfficeSpaceSqm">Office Space (sqm)</label>
                  <input type="number" id="agentOfficeSpaceSqm" min="0" step="1" value="${officeSpaceDisplay}">
                </div>
              </div>
              <div class="auth-edit-actions" style="position:relative;margin-top:1rem;box-shadow:none;border:none;padding:0;">
                <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Save changes</button>
              </div>
            </div>
            </div>
            <div class="agent-tab-content hidden" data-tab="users">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-users"></i> Agent users (${agentUsers.length})</h3>
              <p class="cand-add-hint">Users assigned to this agent. They see only data for this agent.</p>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    ${agentUsers.length ? agentUsers.map(u => `
                      <tr>
                        <td><span class="kanban-card-avatar" style="width:28px;height:28px;font-size:0.7rem;display:inline-flex;align-items:center;justify-content:center;">${u.avatar || (u.name || '')[0]}</span> ${u.name || '-'}</td>
                        <td>${u.email || '-'}</td>
                        <td><span class="badge badge-active">${(u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1)}</span></td>
                        <td><button type="button" class="btn btn-secondary btn-sm" onclick="app.openEditUser('${u.id}')">Edit</button></td>
                      </tr>
                    `).join('') : '<tr><td colspan="4" class="empty-state">No agent users assigned yet. Add a user and assign them to this agent from Users.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            ${buildAgentOverviewGrids(agentId)}
          </div>
        </form>
      </div>
    `);
    setTimeout(() => initAgentProfileTabs(), 0);
  }

  function buildAgentOverviewGrids(agentId) {
    const agentCandidates = mockCandidates.filter(c => c.agentId === agentId);
    const agentUserIds = new Set(mockUsers.filter(u => u.agentId === agentId).map(u => u.id));
    const agentHrs = mockHiringRequests.filter(hr => agentUserIds.has(hr.assignedAgentId));
    const agentAuths = (typeof mockAgentAuthorizations !== 'undefined' ? mockAgentAuthorizations : []).filter(aa => aa.mainAgentId === agentId || aa.eWakalaAgentId === agentId || (aa.agentId && agentUserIds.has(aa.agentId)));
    const recentActivities = (typeof mockActivities !== 'undefined' ? mockActivities : []).filter(act => act.assigneeId && agentUserIds.has(act.assigneeId)).sort((x, y) => (y.date || '').localeCompare(x.date || '')).slice(0, 20);

    const candidatesRows = agentCandidates.map(c => {
      const { job, stage } = getCandidateAssignedJobAndStage(c.id);
      return `<tr><td><a href="#" onclick="app.showCandidate('${c.id}'); return false;">${(c.name || '-').replace(/</g, '&lt;')}</a></td><td>${(c.nationality || '-').replace(/</g, '&lt;')}</td><td>${(c.title || '-').replace(/</g, '&lt;')}</td><td>${(job || '-').replace(/</g, '&lt;')}</td><td>${(stage || '-').replace(/</g, '&lt;')}</td></tr>`;
    }).join('') || '<tr><td colspan="5" class="empty-state">No candidates</td></tr>';

    const hrRows = agentHrs.map(hr => {
      const job = mockJobs.find(j => j.id === hr.jobId);
      const clientName = job?.clientName || (job?.clientId && typeof mockClients !== 'undefined' ? (mockClients.find(cl => cl.id === job.clientId)?.name) : '') || '-';
      const reqNat = (() => { const aa = agentAuths.find(a => a.hiringRequestId === hr.id); return aa && typeof mockNationalities !== 'undefined' ? (mockNationalities.find(n => n.id === aa.nationalityId)?.name) : null; })() || '-';
      return `<tr><td>${(job?.title || '-').replace(/</g, '&lt;')}</td><td>${(hr.number || '-').replace(/</g, '&lt;')}</td><td>${(hr.visaNumber || '-').replace(/</g, '&lt;')}</td><td>${(clientName || '-').replace(/</g, '&lt;')}</td><td>${(job?.title || '-').replace(/</g, '&lt;')}</td><td>${(reqNat || '-').replace(/</g, '&lt;')}</td><td>${(hr.required != null ? hr.required : '-')}</td></tr>`;
    }).join('') || '<tr><td colspan="7" class="empty-state">No hiring requests</td></tr>';

    const authRows = agentAuths.map(aa => {
      const clientName = typeof mockClients !== 'undefined' ? (mockClients.find(c => c.id === aa.clientId)?.name) : '';
      const hr = aa.hiringRequestId ? mockHiringRequests.find(h => h.id === aa.hiringRequestId) : null;
      const job = hr ? mockJobs.find(j => j.id === hr.jobId) : null;
      const natName = typeof mockNationalities !== 'undefined' ? (mockNationalities.find(n => n.id === aa.nationalityId)?.name) : '';
      return `<tr><td>${(aa.code || '-').replace(/</g, '&lt;')}</td><td>${(aa.authorizationDate || aa.issueDate || '-').replace(/</g, '&lt;')}</td><td>${(clientName || '-').replace(/</g, '&lt;')}</td><td>${(job?.title || '-').replace(/</g, '&lt;')}</td><td>${(natName || '-').replace(/</g, '&lt;')}</td></tr>`;
    }).join('') || '<tr><td colspan="5" class="empty-state">No authorizations</td></tr>';

    const activityRows = recentActivities.map(act => `<tr><td>${(act.title || act.type || '-').replace(/</g, '&lt;')}</td><td>${(act.date || '-').replace(/</g, '&lt;')}</td><td>${(act.user || '-').replace(/</g, '&lt;')}</td><td>${(act.status || '-').replace(/</g, '&lt;')}</td></tr>`).join('') || '<tr><td colspan="4" class="empty-state">No recent activities</td></tr>';

    return `
            <div class="agent-tab-content hidden" data-tab="candidates">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-user-friends"></i> Agent Candidates</h3>
              <p class="cand-add-hint">Candidates submitted by this agent.</p>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Candidate Name</th><th>Nationality</th><th>Profession</th><th>Assigned Job</th><th>Current Stage</th></tr></thead>
                  <tbody>${candidatesRows}</tbody>
                </table>
              </div>
            </div>
            </div>
            <div class="agent-tab-content hidden" data-tab="hiringRequests">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-briefcase"></i> Agent Hiring Requests</h3>
              <p class="cand-add-hint">Hiring requests associated with this agent.</p>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Job</th><th>HR Number</th><th>Visa Number</th><th>Client Name</th><th>Profession</th><th>Required Nationality</th><th>Required Quantity</th></tr></thead>
                  <tbody>${hrRows}</tbody>
                </table>
              </div>
            </div>
            </div>
            <div class="agent-tab-content hidden" data-tab="authorizations">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-file-signature"></i> Agent Authorizations</h3>
              <p class="cand-add-hint">Authorizations granted to this agent.</p>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Code</th><th>Auth Date</th><th>Client</th><th>Profession</th><th>Nationality</th></tr></thead>
                  <tbody>${authRows}</tbody>
                </table>
              </div>
            </div>
            </div>
            <div class="agent-tab-content hidden" data-tab="activities">
            <div class="auth-form-section">
              <h3 class="auth-form-section-title"><i class="fas fa-stream"></i> Recent Agent Activities</h3>
              <p class="cand-add-hint">Recent activities performed by this agent in the system.</p>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Date</th><th>User</th><th>Status</th></tr></thead>
                  <tbody>${activityRows}</tbody>
                </table>
              </div>
            </div>
            </div>
    `;
  }

  function initAgentProfileTabs() {
    document.querySelectorAll('.agent-profile-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        if (!tabName) return;
        document.querySelectorAll('.agent-profile-tabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.agent-tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const content = document.querySelector(`.agent-tab-content[data-tab="${tabName}"]`);
        if (content) content.classList.remove('hidden');
      });
    });
  }

  function submitEditAgentInPage(id) {
    const a = mockAgents.find(x => x.id === id);
    if (!a) return;
    const code = document.getElementById('agentCode')?.value?.trim();
    const name = document.getElementById('agentName')?.value?.trim();
    const nameEn = document.getElementById('agentNameEn')?.value?.trim() || '';
    const licenseNo = document.getElementById('agentLicenseNo')?.value?.trim() || '';
    const officeOfficialName = document.getElementById('officeOfficialName')?.value?.trim() || '';
    const agentType = document.getElementById('agentType')?.value || 'External';
    const country = document.getElementById('agentCountry')?.value?.trim() || '';
    const city = document.getElementById('agentCity')?.value?.trim() || '';
    const supplierSite = document.getElementById('agentSupplierSite')?.value?.trim() || '';
    const phone = document.getElementById('agentPhone')?.value?.trim() || '';
    const streetName = document.getElementById('agentStreetName')?.value?.trim() || '';
    const poBox = document.getElementById('agentPoBox')?.value?.trim() || '';
    const fax = document.getElementById('agentFax')?.value?.trim() || '';
    const buildingNumber = document.getElementById('agentBuildingNumber')?.value?.trim() || '';
    const officeSpaceSqm = document.getElementById('agentOfficeSpaceSqm')?.value?.trim() || '';
    if (!code || !name) return alert('Please fill required fields');
    Object.assign(a, {
      code,
      name,
      nameEn,
      licenseNo,
      officeOfficialName,
      agentType,
      country,
      city,
      supplierSite,
      phone,
      streetName,
      poBox,
      fax,
      buildingNumber,
      officeSpaceSqm
    });
    renderAgentProfile(id);
  }

  function showAgent(id) {
    setActiveNav('agents');
    renderAgentProfile(id);
  }

  // --- Taeed (MOL Support) - Admin only ---
  function renderTaeedsList() {
    setActiveNav('taeed');
    const list = (typeof mockTaeeds !== 'undefined' ? mockTaeeds : []);
    render(`
      <div class="page-header">
        <h1 class="page-title">Taeed (MOL Support)</h1>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Issued No</th><th>Visa Type</th><th>Issue Date</th><th>Sector</th><th>Taed Quantity</th><th>Total Visa</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.length ? list.map(t => `
                <tr>
                  <td><strong>${(t.issuedNo || '-').replace(/</g, '&lt;')}</strong></td>
                  <td>${(t.visaType || '-').replace(/</g, '&lt;')}</td>
                  <td>${(t.issueDate || '-').replace(/</g, '&lt;')}</td>
                  <td>${(t.sectorType || '-').replace(/</g, '&lt;')}</td>
                  <td>${t.taedQuantity != null ? t.taedQuantity : '-'}</td>
                  <td>${t.totalVisa != null ? t.totalVisa : '-'}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="app.showTaeed('${t.id}')">Open</button></td>
                </tr>
              `).join('') : '<tr><td colspan="7" class="empty-state">No Taeed records. Add sample data in data.js.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  function showTaeed(id) {
    setActiveNav('taeed');
    renderTaeedProfile(id);
  }

  function buildVisaStatusDashboardHtml(counts, title) {
    const statuses = (typeof VISA_DASHBOARD_STATUSES !== 'undefined' ? VISA_DASHBOARD_STATUSES : []);
    const colors = { 'Visa Numbers':'#6366f1','Available':'#22c55e','Hiring Request':'#f97316','Authorization':'#eab308','Labors on Visa':'#f97316','Arrived':'#22c55e','Escap':'#dc2626','Not-Arrived':'#dc2626','Labours Visa Expired':'#f97316','Expire Soon':'#dc2626' };
    return `<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
      ${statuses.map(s => {
        const c = (counts && counts[s]) ?? 0;
        const col = colors[s] || '#94a3b8';
        return `<div style="flex:0 0 100px;background:${col};color:#fff;padding:0.75rem;border-radius:8px;text-align:center;"><div style="font-size:0.8rem;">${s}</div><div style="font-size:1.25rem;font-weight:bold;">${c}</div></div>`;
      }).join('')}
    </div>`;
  }

  function renderTaeedProfile(taeedId) {
    const t = (typeof mockTaeeds !== 'undefined' ? mockTaeeds : []).find(x => x.id === taeedId);
    if (!t) return renderTaeedsList();
    const details = (typeof mockTaeedDetails !== 'undefined' ? mockTaeedDetails : []).filter(d => d.taeedId === taeedId);
    const professionGroups = {};
    details.forEach(d => { professionGroups[d.profession] = (professionGroups[d.profession] || 0) + (d.visasQty || 0); });
    const selDetail = details.find(d => d.id === selectedTaeedDetailId);
    const detailVisaCounts = selDetail ? { 'Visa Numbers': selDetail.visasQty || 0, 'Available': 0, 'Hiring Request': 0, 'Authorization': 0, 'Labors on Visa': 0, 'Arrived': 0, 'Escap': 0, 'Not-Arrived': 0, 'Labours Visa Expired': 0, 'Expire Soon': 0 } : null;
    setActiveNav('taeed');
    render(`
      <div class="auth-edit-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('taeed')"><i class="fas fa-arrow-left"></i> Taeed</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${(t.issuedNo || '').replace(/</g, '&lt;')}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Taeed: ${(t.issuedNo || '').replace(/</g, '&lt;')}</h1>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">MOL Support / تایید - DashBoard</div>
          <p class="cand-add-hint">Box for each profession in Taeed Details</p>
          <div class="taeed-dashboard-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem;">
            ${Object.entries(professionGroups).length ? Object.entries(professionGroups).map(([prof, qty]) => `
              <div class="taeed-dash-card" style="border:1px solid var(--border-color,#e0e0e0);border-radius:8px;overflow:hidden;">
                <div style="background:var(--orange,#f97316);color:#fff;padding:0.75rem;text-align:center;font-weight:bold;">${(prof || '-').replace(/</g, '&lt;')}</div>
                <div style="padding:0.5rem;text-align:center;font-size:1.5rem;font-weight:bold;">${qty}</div>
                <div style="padding:0.25rem 0.5rem;font-size:0.85rem;color:#666;">المتبقي ${qty}</div>
              </div>
            `).join('') : '<p class="empty-state">No Taeed details</p>'}
          </div>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">Taeed Details</div>
          <div class="auth-form-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">
            <div class="form-group"><label>Issued No <span class="required">*</span></label><div class="form-value"><i class="fas fa-lock" style="opacity:0.5;"></i> ${(t.issuedNo || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Visa Type <span class="required">*</span></label><div class="form-value">${(t.visaType || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Issue Date Hijri</label><div class="form-value">${(t.issueDateHijri || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Issue Date <span class="required">*</span></label><div class="form-value">${(t.issueDate || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Sector Type <span class="required">*</span></label><div class="form-value">${(t.sectorType || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Support case</label><div class="form-value">${(t.supportCase || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Expiry Date Hijri</label><div class="form-value">${(t.expiryDateHijri || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Expiry Date</label><div class="form-value">${(t.expiryDate || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>MOL Employer</label><div class="form-value">${(t.molEmployer || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Work Owner No.</label><div class="form-value">${(t.workOwnerNo || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Taed Quantity</label><div class="form-value">${t.taedQuantity != null ? t.taedQuantity : '-'}</div></div>
            <div class="form-group"><label>Total Visa</label><div class="form-value">${t.totalVisa != null ? t.totalVisa : '-'}</div></div>
            <div class="form-group"><label>Issued Visa number</label><div class="form-value">${(t.issuedVisaNumber != null ? t.issuedVisaNumber : '-')}</div></div>
            <div class="form-group"><label>Taed Cancel</label><div class="form-value">${t.taedCancel != null ? t.taedCancel : '0'}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Taeed Details (General)</div>
          <p class="cand-add-hint">Taeed Detail quantity takes from Taeed Quantity; detail defines the profession. Click Edit to open the detail form in a new page, or use Dashboard for VISA info.</p>
          ${selDetail ? `<div style="margin-bottom:1rem;padding:1rem;background:#f8fafc;border-radius:8px;"><strong>VISA: INFORMATION - ${(selDetail.profession || '').replace(/</g, '&lt;')}</strong> <button type="button" class="btn btn-ghost btn-sm" onclick="app.clearTaeedDetailSelection('${taeedId}')">Close</button>${buildVisaStatusDashboardHtml(detailVisaCounts, '')}</div>` : ''}
          <div class="table-wrap">
            <table>
              <thead><tr><th>MOL No</th><th>Profession</th><th>Nationality</th><th>Gender</th><th>Visas QTY</th><th>Sector</th><th>Coming City</th><th>Action</th></tr></thead>
              <tbody>
                ${details.length ? details.map(d => `
                  <tr style="cursor:pointer;" onclick="app.openTaeedDetailForm('${taeedId}','${d.id}');event.stopPropagation();">
                    <td>${(d.molNo || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.profession || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.nationality || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.gender || '-').replace(/</g, '&lt;')}</td>
                    <td>${d.visasQty != null ? d.visasQty : '-'}</td>
                    <td>${(d.sector || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.comingCity || '-').replace(/</g, '&lt;')}</td>
                    <td onclick="event.stopPropagation();">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="app.openTaeedDetailForm('${taeedId}','${d.id}')">Edit</button>
                      <button type="button" class="btn btn-ghost btn-sm" onclick="app.showTaeedDetailVisaDashboard('${taeedId}','${d.id}')">Dashboard</button>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="8" class="empty-state">No details</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);
  }

  function openTaeedDetailForm(taeedId, detailId) {
    renderTaeedDetailFormPage(taeedId, detailId);
  }

  function renderTaeedDetailFormPage(taeedId, detailId) {
    const t = (typeof mockTaeeds !== 'undefined' ? mockTaeeds : []).find(x => x.id === taeedId);
    const d = (typeof mockTaeedDetails !== 'undefined' ? mockTaeedDetails : []).find(x => x.id === detailId);
    if (!t || !d) return renderTaeedsList();
    setActiveNav('taeed');
    const esc = v => (v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const detailVisaCounts = { 'Visa Numbers': d.visasQty || 0, 'Available': 0, 'Hiring Request': 0, 'Authorization': 0, 'Labors on Visa': 0, 'Arrived': 0, 'Escap': 0, 'Not-Arrived': 0, 'Labours Visa Expired': 0, 'Expire Soon': 0 };
    render(`
      <div class="auth-edit-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('taeed')"><i class="fas fa-arrow-left"></i> Taeed</a>
          <span class="breadcrumb-sep">/</span>
          <a class="back-link" onclick="app.showTaeed('${taeedId}')">${esc(t.issuedNo || '')}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">Detail: ${esc(d.profession || 'Edit')}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Taeed Detail - ${esc(d.profession || 'Edit')}</h1>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">VISA: INFORMATION - ${esc(d.profession || '')}</div>
          ${buildVisaStatusDashboardHtml(detailVisaCounts, '')}
        </div>
        <div class="card">
          <div class="auth-form-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">
            <div class="form-group"><label>MOL No</label><input type="text" id="tdMolNo" value="${esc(d.molNo)}" placeholder="MOL No"></div>
            <div class="form-group"><label>MOL Header</label><input type="text" id="tdMolHeader" value="${esc(d.molHeader)}" placeholder="MOL Header"></div>
            <div class="form-group"><label>Profession</label><input type="text" id="tdProfession" value="${esc(d.profession)}" placeholder="e.g. Housemaid"></div>
            <div class="form-group"><label>Nationality</label><input type="text" id="tdNationality" value="${esc(d.nationality)}" placeholder="e.g. Block"></div>
            <div class="form-group"><label>Gender</label><input type="text" id="tdGender" value="${esc(d.gender)}" placeholder="Female/Male"></div>
            <div class="form-group"><label>Visas QTY</label><input type="number" id="tdVisasQty" value="${d.visasQty != null ? d.visasQty : ''}" placeholder="Quantity"></div>
            <div class="form-group"><label>Sector</label><input type="text" id="tdSector" value="${esc(d.sector)}" placeholder="e.g. Household"></div>
            <div class="form-group"><label>Coming City</label><input type="text" id="tdComingCity" value="${esc(d.comingCity)}" placeholder="Coming City"></div>
          </div>
          <div style="margin-top:1.5rem;display:flex;gap:0.5rem;">
            <button type="button" class="btn btn-primary" onclick="app.saveTaeedDetailForm('${taeedId}','${detailId}')"><i class="fas fa-save"></i> Save</button>
            <button type="button" class="btn btn-ghost" onclick="app.showTaeed('${taeedId}')">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  function saveTaeedDetailForm(taeedId, detailId) {
    const d = (typeof mockTaeedDetails !== 'undefined' ? mockTaeedDetails : []).find(x => x.id === detailId);
    if (!d) return;
    d.molNo = document.getElementById('tdMolNo')?.value?.trim() ?? d.molNo;
    d.molHeader = document.getElementById('tdMolHeader')?.value?.trim() ?? d.molHeader;
    d.profession = document.getElementById('tdProfession')?.value?.trim() ?? d.profession;
    d.nationality = document.getElementById('tdNationality')?.value?.trim() ?? d.nationality;
    d.gender = document.getElementById('tdGender')?.value?.trim() ?? d.gender;
    const qty = document.getElementById('tdVisasQty')?.value;
    d.visasQty = qty !== '' && qty != null ? parseInt(qty, 10) : d.visasQty;
    d.sector = document.getElementById('tdSector')?.value?.trim() ?? d.sector;
    d.comingCity = document.getElementById('tdComingCity')?.value?.trim() ?? d.comingCity;
    renderTaeedProfile(taeedId);
  }

  function showTaeedDetailVisaDashboard(taeedId, detailId) {
    selectedTaeedDetailId = detailId;
    renderTaeedProfile(taeedId);
  }

  function clearTaeedDetailSelection(taeedId) {
    selectedTaeedDetailId = null;
    renderTaeedProfile(taeedId);
  }

  function clearIssuedVisaDetailSelection(headerId) {
    selectedIssuedVisaDetailId = null;
    renderIssuedVisaHeaderProfile(headerId);
  }

  // --- Issued Visa - Admin only ---
  function renderIssuedVisaList() {
    setActiveNav('issuedVisa');
    const list = (typeof mockIssuedVisaHeaders !== 'undefined' ? mockIssuedVisaHeaders : []);
    render(`
      <div class="page-header">
        <h1 class="page-title">Issued Visa</h1>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Issued No</th><th>Visa Type</th><th>Issue Date</th><th>Sector</th><th>Total Visa</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${list.length ? list.map(h => `
                <tr>
                  <td><strong>${(h.issuedNo || '-').replace(/</g, '&lt;')}</strong></td>
                  <td>${(h.visaType || '-').replace(/</g, '&lt;')}</td>
                  <td>${(h.issueDate || '-').replace(/</g, '&lt;')}</td>
                  <td>${(h.sectorType || '-').replace(/</g, '&lt;')}</td>
                  <td>${h.totalVisa != null ? h.totalVisa : '-'}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="app.showIssuedVisaHeader('${h.id}')">Open</button></td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="empty-state">No Issued Visa records.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `);
  }

  function showIssuedVisaHeader(id) {
    setActiveNav('issuedVisa');
    renderIssuedVisaHeaderProfile(id);
  }

  function renderIssuedVisaHeaderProfile(headerId) {
    const h = (typeof mockIssuedVisaHeaders !== 'undefined' ? mockIssuedVisaHeaders : []).find(x => x.id === headerId);
    if (!h) return renderIssuedVisaList();
    const details = (typeof mockIssuedVisaDetails !== 'undefined' ? mockIssuedVisaDetails : []).filter(d => d.headerId === headerId);
    const professionGroups = {};
    details.forEach(d => { professionGroups[d.profession] = (professionGroups[d.profession] || 0) + (d.visasQty || 0); });
    const selDetail = details.find(d => d.id === selectedIssuedVisaDetailId);
    const detailVisaCounts = selDetail ? { 'Visa Numbers': selDetail.visasQty || 0, 'Available': 0, 'Hiring Request': 198, 'Authorization': 36, 'Labors on Visa': 182, 'Arrived': 53, 'Escap': 0, 'Not-Arrived': 129, 'Labours Visa Expired': 129, 'Expire Soon': 0 } : null;
    setActiveNav('issuedVisa');
    render(`
      <div class="auth-edit-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('issuedVisa')"><i class="fas fa-arrow-left"></i> Issued Visa</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${(h.issuedNo || '').replace(/</g, '&lt;')}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Issued Visa: ${(h.issuedNo || '').replace(/</g, '&lt;')}</h1>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">تأشيرة صادرة / Issued Visa - DashBoard</div>
          <p class="cand-add-hint">Box for each detail in issued visa header</p>
          <div class="taeed-dashboard-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem;">
            ${Object.entries(professionGroups).length ? Object.entries(professionGroups).map(([prof, qty]) => `
              <div class="taeed-dash-card" style="border:1px solid var(--border-color,#e0e0e0);border-radius:8px;overflow:hidden;">
                <div style="background:var(--orange,#f97316);color:#fff;padding:0.75rem;text-align:center;font-weight:bold;">${(prof || '-').replace(/</g, '&lt;')}</div>
                <div style="padding:0.5rem;text-align:center;font-size:1.5rem;font-weight:bold;">${qty}</div>
                <div style="padding:0.25rem 0.5rem;font-size:0.85rem;color:#666;">المتبقي ${qty}</div>
              </div>
            `).join('') : '<p class="empty-state">No issued visa details</p>'}
          </div>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">Issued Visa Header</div>
          <div class="auth-form-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">
            <div class="form-group"><label>Issued No <span class="required">*</span></label><div class="form-value"><i class="fas fa-lock" style="opacity:0.5;"></i> ${(h.issuedNo || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Visa Type <span class="required">*</span></label><div class="form-value">${(h.visaType || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Issue Date Hijri</label><div class="form-value">${(h.issueDateHijri || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Issue Date</label><div class="form-value">${(h.issueDate || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Sector Type</label><div class="form-value">${(h.sectorType || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>MOL Employer</label><div class="form-value">${(h.molEmployer || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Work Owner No.</label><div class="form-value">${(h.workOwnerNo || '-').replace(/</g, '&lt;')}</div></div>
            <div class="form-group"><label>Total Visa</label><div class="form-value">${h.totalVisa != null ? h.totalVisa : '-'}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Issued Visa Details</div>
          <p class="cand-add-hint">Detail defines profession and nationality. Click Edit to open the detail form in a new page, or Dashboard for VISA info.</p>
          ${selDetail ? `<div style="margin-bottom:1rem;padding:1rem;background:#f8fafc;border-radius:8px;"><strong>Visa Header Details - ${(selDetail.profession || '').replace(/</g, '&lt;')} / ${(selDetail.nationality || '').replace(/</g, '&lt;')}</strong> <button type="button" class="btn btn-ghost btn-sm" onclick="app.clearIssuedVisaDetailSelection('${headerId}')">Close</button>${buildVisaStatusDashboardHtml(detailVisaCounts, '')}</div>` : ''}
          <div class="table-wrap">
            <table>
              <thead><tr><th>Visa No</th><th>Profession</th><th>Nationality</th><th>Gender</th><th>Visas QTY</th><th>Status</th><th>Visa Expire Date</th><th>Action</th></tr></thead>
              <tbody>
                ${details.length ? details.map(d => `
                  <tr style="cursor:pointer;" onclick="app.openIssuedVisaDetailForm('${headerId}','${d.id}');event.stopPropagation();">
                    <td>${(d.visaNo || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.profession || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.nationality || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.gender || '-').replace(/</g, '&lt;')}</td>
                    <td>${d.visasQty != null ? d.visasQty : '-'}</td>
                    <td>${(d.statusReason || '-').replace(/</g, '&lt;')}</td>
                    <td>${(d.visaExpireDate || '-').replace(/</g, '&lt;')}</td>
                    <td onclick="event.stopPropagation();">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="app.openIssuedVisaDetailForm('${headerId}','${d.id}')">Edit</button>
                      <button type="button" class="btn btn-ghost btn-sm" onclick="app.showIssuedVisaDetailDashboard('${headerId}','${d.id}')">Dashboard</button>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="8" class="empty-state">No details</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `);
  }

  function openIssuedVisaDetailForm(headerId, detailId) {
    renderIssuedVisaDetailFormPage(headerId, detailId);
  }

  function renderIssuedVisaDetailFormPage(headerId, detailId) {
    const h = (typeof mockIssuedVisaHeaders !== 'undefined' ? mockIssuedVisaHeaders : []).find(x => x.id === headerId);
    const d = (typeof mockIssuedVisaDetails !== 'undefined' ? mockIssuedVisaDetails : []).find(x => x.id === detailId);
    if (!h || !d) return renderIssuedVisaList();
    setActiveNav('issuedVisa');
    const esc = v => (v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const detailVisaCounts = { 'Visa Numbers': d.visasQty || 0, 'Available': 0, 'Hiring Request': 0, 'Authorization': 0, 'Labors on Visa': 0, 'Arrived': 0, 'Escap': 0, 'Not-Arrived': 0, 'Labours Visa Expired': 0, 'Expire Soon': 0 };
    render(`
      <div class="auth-edit-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.showView('issuedVisa')"><i class="fas fa-arrow-left"></i> Issued Visa</a>
          <span class="breadcrumb-sep">/</span>
          <a class="back-link" onclick="app.showIssuedVisaHeader('${headerId}')">${esc(h.issuedNo || '')}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">Detail: ${esc(d.profession || '')} / ${esc(d.nationality || '')}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">Issued Visa Detail - ${esc(d.profession || '')} / ${esc(d.nationality || '')}</h1>
        </div>
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="card-title">VISA: INFORMATION - ${esc(d.profession || '')} / ${esc(d.nationality || '')}</div>
          ${buildVisaStatusDashboardHtml(detailVisaCounts, '')}
        </div>
        <div class="card">
          <div class="auth-form-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">
            <div class="form-group"><label>Visa No</label><input type="text" id="ivdVisaNo" value="${esc(d.visaNo)}" placeholder="Visa No"></div>
            <div class="form-group"><label>Profession</label><input type="text" id="ivdProfession" value="${esc(d.profession)}" placeholder="e.g. Housemaid"></div>
            <div class="form-group"><label>Nationality</label><input type="text" id="ivdNationality" value="${esc(d.nationality)}" placeholder="e.g. Uganda"></div>
            <div class="form-group"><label>Gender</label><input type="text" id="ivdGender" value="${esc(d.gender)}" placeholder="Female/Male"></div>
            <div class="form-group"><label>Visas QTY</label><input type="number" id="ivdVisasQty" value="${d.visasQty != null ? d.visasQty : ''}" placeholder="Quantity"></div>
            <div class="form-group"><label>Status</label><input type="text" id="ivdStatusReason" value="${esc(d.statusReason)}" placeholder="Active"></div>
            <div class="form-group"><label>Sector</label><input type="text" id="ivdSector" value="${esc(d.sector)}" placeholder="e.g. Household"></div>
            <div class="form-group"><label>Coming City</label><input type="text" id="ivdComingCity" value="${esc(d.comingCity)}" placeholder="Coming City"></div>
            <div class="form-group"><label>Visa Expire Date</label><input type="text" id="ivdVisaExpireDate" value="${esc(d.visaExpireDate)}" placeholder="dd/mm/yyyy"></div>
            <div class="form-group"><label>From MOL Support</label><input type="text" id="ivdFromMolSupport" value="${esc(d.fromMolSupport)}" placeholder=""></div>
          </div>
          <div style="margin-top:1.5rem;display:flex;gap:0.5rem;">
            <button type="button" class="btn btn-primary" onclick="app.saveIssuedVisaDetailForm('${headerId}','${detailId}')"><i class="fas fa-save"></i> Save</button>
            <button type="button" class="btn btn-ghost" onclick="app.showIssuedVisaHeader('${headerId}')">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  function saveIssuedVisaDetailForm(headerId, detailId) {
    const d = (typeof mockIssuedVisaDetails !== 'undefined' ? mockIssuedVisaDetails : []).find(x => x.id === detailId);
    if (!d) return;
    d.visaNo = document.getElementById('ivdVisaNo')?.value?.trim() ?? d.visaNo;
    d.profession = document.getElementById('ivdProfession')?.value?.trim() ?? d.profession;
    d.nationality = document.getElementById('ivdNationality')?.value?.trim() ?? d.nationality;
    d.gender = document.getElementById('ivdGender')?.value?.trim() ?? d.gender;
    const qty = document.getElementById('ivdVisasQty')?.value;
    d.visasQty = qty !== '' && qty != null ? parseInt(qty, 10) : d.visasQty;
    d.statusReason = document.getElementById('ivdStatusReason')?.value?.trim() ?? d.statusReason;
    d.sector = document.getElementById('ivdSector')?.value?.trim() ?? d.sector;
    d.comingCity = document.getElementById('ivdComingCity')?.value?.trim() ?? d.comingCity;
    d.visaExpireDate = document.getElementById('ivdVisaExpireDate')?.value?.trim() ?? d.visaExpireDate;
    d.fromMolSupport = document.getElementById('ivdFromMolSupport')?.value?.trim() ?? d.fromMolSupport;
    renderIssuedVisaHeaderProfile(headerId);
  }

  function showIssuedVisaDetailDashboard(headerId, detailId) {
    selectedIssuedVisaDetailId = detailId;
    renderIssuedVisaHeaderProfile(headerId);
  }

  // --- USER GUIDE ---
  function renderUserGuide() {
    render(`
      <div class="page-header">
        <h1 class="page-title"><i class="fas fa-book"></i> User Guide</h1>
        <p class="page-subtitle">How to use EXCP Agent HR Portal</p>
      </div>
      <div class="user-guide">
        <section class="guide-section">
          <h2>1. Getting Started</h2>
          <p><strong>Login:</strong> Use your email and password. Admin sees all data; agents see only their own candidates and assigned hiring requests.</p>
          <p><strong>Role:</strong> Admin manages clients, agents, jobs, authorizations, hiring requests, Taeed, Issued Visa, and users. Agents manage candidates and work within their assigned hiring requests.</p>
        </section>
        <section class="guide-section">
          <h2>2. Dashboard (Home)</h2>
          <ul>
            <li><strong>General:</strong> Jobs per client, candidates per agent, agents per country. Filter and view hiring pipeline by job, client, agent, or hiring request.</li>
            <li><strong>Hiring Stages:</strong> See candidates in each stage (Sourcing → Screening → … → Placed). Move candidates between stages from the kanban.</li>
            <li><strong>Agent Performance:</strong> Select an agent to see their hiring requests, placements, and activity. Stage move timings show on-time, late, or excellent.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>3. Clients</h2>
          <p>View client list. Open a client to see their jobs and hiring requests.</p>
        </section>
        <section class="guide-section">
          <h2>4. Agents</h2>
          <p><em>Admin only.</em> Manage recruitment agencies. Open an agent to see tabs: Details, Users, Candidates, Hiring Requests, Authorizations, Recent Activities.</p>
        </section>
        <section class="guide-section">
          <h2>5. Jobs</h2>
          <p>List of jobs. Click a job to see hiring requests, candidates in pipeline, and activities. Create jobs via Quick Create or Jobs page.</p>
        </section>
        <section class="guide-section">
          <h2>6. Authorizations & Hiring Requests</h2>
          <ul>
            <li><strong>Authorizations:</strong> Visa authorizations linked to clients and hiring requests.</li>
            <li><strong>Hiring Requests:</strong> Each job can have multiple hiring requests. Assign them to agent users. Add hiring requests from the job profile.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>7. Candidates</h2>
          <ul>
            <li>Create candidates manually or convert from CVs.</li>
            <li>Assign candidates to hiring requests (one active job per candidate).</li>
            <li>Each candidate belongs to one agent. Admin selects agent when creating/editing.</li>
            <li>Click the eye icon on a candidate card to open their profile.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>8. CVs</h2>
          <p>Upload CVs (PDF, DOC, DOCX). Convert to candidates using AI Parse or manual entry.</p>
        </section>
        <section class="guide-section">
          <h2>9. Recruitment Center</h2>
          <ul>
            <li><strong>Matches:</strong> AI-suggested or manual matching of candidates to hiring requests.</li>
            <li><strong>Placements:</strong> View placed candidates per job.</li>
            <li><strong>Activities:</strong> Stage changes, interviews, calls, etc.</li>
            <li><strong>Inbox:</strong> Messages and notifications.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>10. Taeed (MOL Support)</h2>
          <p><em>Admin only.</em></p>
          <ul>
            <li>List of Taeed records. Click <strong>Open</strong> to view a Taeed: dashboard by profession, header form, and details table.</li>
            <li>Click a detail row or <strong>Edit</strong> to open the detail form in a new page. The detail dashboard (VISA INFORMATION) appears at the top.</li>
            <li><strong>Dashboard</strong> button shows the Visa status dashboard inline without opening the form page.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>11. Issued Visa</h2>
          <p><em>Admin only.</em></p>
          <ul>
            <li>List of Issued Visa headers. Click <strong>Open</strong> to view header, dashboard, and details.</li>
            <li>Click a detail row or <strong>Edit</strong> to open the detail form in a new page with dashboard at top.</li>
            <li><strong>Dashboard</strong> button shows Visa status inline.</li>
          </ul>
        </section>
        <section class="guide-section">
          <h2>12. Reports & Settings</h2>
          <ul>
            <li><strong>Reports:</strong> Jobs, candidates, placements, hiring requests, authorizations. Agent performance summary. Data validation status.</li>
            <li><strong>Hiring Stages:</strong> Admin configures target days per stage for KPI calculations.</li>
            <li><strong>Settings:</strong> Hiring stages order, nationalities, skill taxonomy, rejection reasons, SLA.</li>
          </ul>
        </section>
      </div>
    `);
  }

  // --- REPORTS ---
  function renderReports() {
    const placedCount = Object.keys(mockAssignments || {}).reduce((sum, hrId) => {
      const placed = (mockAssignments[hrId] && mockAssignments[hrId]['Placed']) || [];
      return sum + placed.length;
    }, 0);
    const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const unassignedCount = mockCandidates.filter(c => !getCandidateActiveAssignment(c.id)).length;
    const agentPerf = (mockAgents || []).map(ag => {
      const agentUserIds = (mockUsers || []).filter(u => u.agentId === ag.id).map(u => u.id);
      const hrs = (mockHiringRequests || []).filter(hr => agentUserIds.includes(hr.assignedAgentId));
      const jobs = [...new Set(hrs.map(hr => hr.jobId))];
      const placed = Object.keys(mockAssignments || {}).reduce((s, hrId) => {
        if (!agentUserIds.includes((mockHiringRequests || []).find(h => h.id === hrId)?.assignedAgentId)) return s;
        const arr = (mockAssignments[hrId] && mockAssignments[hrId]['Placed']) || [];
        return s + arr.length;
      }, 0);
      return `${ag.name} (${ag.country}): ${placed} placement(s), ${hrs.length} hiring request(s) in ${jobs.length} job(s), ${mockCandidates.filter(c => c.agentId === ag.id).length} candidates`;
    }).join('</p><p>');
    render(`
      <div class="page-header">
        <h1 class="page-title">Reports</h1>
        <button class="btn btn-secondary"><i class="fas fa-file-excel"></i> Export Excel</button>
        <button class="btn btn-secondary"><i class="fas fa-file-pdf"></i> Export PDF</button>
      </div>
      <div class="grid-dashboard">
        <div class="widget">
          <div class="widget-value">${mockJobs.length}</div>
          <div class="widget-label">Jobs</div>
        </div>
        <div class="widget">
          <div class="widget-value">${getVisibleCandidates().length}</div>
          <div class="widget-label">Total Candidates</div>
        </div>
        <div class="widget">
          <div class="widget-value">${unassignedCount}</div>
          <div class="widget-label">Unassigned Candidates</div>
        </div>
        <div class="widget">
          <div class="widget-value">${placedCount}</div>
          <div class="widget-label">Total Placements</div>
        </div>
        <div class="widget">
          <div class="widget-value">${mockHiringRequests.length}</div>
          <div class="widget-label">Hiring Requests</div>
        </div>
        <div class="widget">
          <div class="widget-value">${(mockAgentAuthorizations || []).length}</div>
          <div class="widget-label">Authorizations</div>
        </div>
      </div>
      <div class="card" style="margin-top:1.5rem;">
        <div class="card-title">Agent Performance Summary</div>
        <p>${agentPerf || 'No agent data.'}</p>
      </div>
      <div class="card" style="margin-top:1rem;">
        <div class="card-title">Data Validation</div>
        ${(function(){
          const v = typeof validateData === 'function' ? validateData() : { valid: true, errors: [] };
          return v.valid
            ? '<p style="color:var(--success);"><i class="fas fa-check-circle"></i> All data valid.</p>'
            : '<p style="color:var(--error,#c53030);"><i class="fas fa-exclamation-triangle"></i> Issues: ' + (v.errors || []).join('; ') + '</p>';
        })()}
      </div>
    `);
  }

  // --- HIRING STAGES SETTINGS (admin only: target days per stage for KPIs) ---
  function renderHiringStagesSettings() {
    if (!isAdmin()) return showView('dashboard');
    const stages = typeof DEFAULT_STAGES !== 'undefined' ? DEFAULT_STAGES : [];
    const rows = stages.map(stage => {
      const val = (typeof STAGE_TARGET_DAYS !== 'undefined' && STAGE_TARGET_DAYS[stage] != null) ? STAGE_TARGET_DAYS[stage] : '';
      return `
        <tr>
          <td class="stage-name-cell">${stage}</td>
          <td>
            <input type="number" min="0" step="1" class="stage-days-input" data-stage="${stage.replace(/"/g, '&quot;')}" value="${val}" placeholder="—">
          </td>
        </tr>
      `;
    }).join('');
    render(`
      <div class="page-header">
        <h1 class="page-title">Hiring Stages</h1>
        <p class="page-subtitle">Set target days to take action per stage (used for agent KPIs). Leave blank if not applicable.</p>
      </div>
      <div class="card hiring-stages-settings-card">
        <table class="hiring-stages-settings-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Days to take action</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="hiring-stages-settings-actions">
          <button type="button" class="btn btn-primary" onclick="app.submitHiringStagesTargetDays()"><i class="fas fa-save"></i> Save</button>
          <a href="#" class="back-link" onclick="app.showView('settings'); return false;" style="margin-left:1rem;">Back to Settings</a>
        </div>
      </div>
    `);
  }

  function submitHiringStagesTargetDays() {
    if (!isAdmin()) return;
    const inputs = document.querySelectorAll('.stage-days-input');
    inputs.forEach(inp => {
      const stage = inp.getAttribute('data-stage');
      if (!stage || typeof STAGE_TARGET_DAYS === 'undefined') return;
      const raw = inp.value.trim();
      const num = raw === '' ? null : parseInt(inp.value, 10);
      STAGE_TARGET_DAYS[stage] = (num !== null && !isNaN(num) && num >= 0) ? num : null;
    });
    renderHiringStagesSettings();
    if (typeof alert === 'function') alert('Target days saved.');
  }

  // --- SETTINGS ---
  function renderSettings() {
    render(`
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-title">Hiring Stages</div>
        <p>${DEFAULT_STAGES.join(' → ')}</p>
        ${isAdmin() ? `<a href="#" class="lookup-link" onclick="app.showView('hiringStagesSettings'); return false;">Configure target days per stage →</a>` : ''}
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-title">Nationalities</div>
        <p>Philippines, India, Egypt, Jordan, Pakistan, Bangladesh</p>
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-title">Skill Taxonomy</div>
        <p>ICU, Emergency, OR, Cardiac, Pediatrics, BLS, ACLS</p>
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-title">Rejection Reasons</div>
        <p>Salary mismatch, Skills gap, Visa issues, Withdrawn, Other</p>
      </div>
      <div class="card">
        <div class="card-title">SLA Configuration</div>
        <p>Target time-to-hire: 30 days | CV review SLA: 48 hours</p>
      </div>
    `);
  }

  function editJobSummary(jobId) {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) return;
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Edit Job Summary</div>
      <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
        <div class="form-group">
          <label>Job Brief</label>
          <textarea id="editJobBrief" rows="4" placeholder="Describe the role...">${job.jobBrief || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Responsibilities (one per line)</label>
          <textarea id="editResponsibilities" rows="5" placeholder="Enter each responsibility on a new line">${(job.responsibilities || []).join('\n')}</textarea>
        </div>
        <div class="form-group">
          <label>Job Requirements (comma separated)</label>
          <input type="text" id="editJobRequirements" value="${(job.jobRequirements || []).join(', ')}" placeholder="e.g. RN license, BLS certification">
        </div>
        <hr style="margin:1rem 0;">
        <div class="form-group">
          <label>Job Location</label>
          <input type="text" id="editLocation" value="${job.location || ''}">
        </div>
        <div class="form-group">
          <label>Experience Level</label>
          <select id="editExperienceLevel">
            <option value="">—</option>
            <option value="Junior" ${job.experienceLevel==='Junior'?'selected':''}>Junior</option>
            <option value="Mid-level" ${job.experienceLevel==='Mid-level'?'selected':''}>Mid-level</option>
            <option value="Senior" ${job.experienceLevel==='Senior'?'selected':''}>Senior</option>
          </select>
        </div>
        <div class="form-group">
          <label>Contract Type</label>
          <select id="editContractType">
            <option value="Full-time" ${job.contractType==='Full-time'?'selected':''}>Full-time</option>
            <option value="Part-time" ${job.contractType==='Part-time'?'selected':''}>Part-time</option>
            <option value="Contract" ${job.contractType==='Contract'?'selected':''}>Contract</option>
          </select>
        </div>
        <div class="form-group">
          <label>Min Salary</label>
          <input type="text" id="editMinSalary" value="${job.minSalary || ''}" placeholder="e.g. 5500">
        </div>
        <div class="form-group">
          <label>Max Salary</label>
          <input type="text" id="editMaxSalary" value="${job.maxSalary || ''}" placeholder="e.g. 6750">
        </div>
        <div class="form-group">
          <label>Currency</label>
          <input type="text" id="editCurrency" value="${job.currency || 'SAR'}">
        </div>
        <div class="form-group">
          <label>Frequency</label>
          <select id="editFrequency">
            <option value="Monthly" ${job.frequency==='Monthly'?'selected':''}>Monthly</option>
            <option value="Yearly" ${job.frequency==='Yearly'?'selected':''}>Yearly</option>
            <option value="Hourly" ${job.frequency==='Hourly'?'selected':''}>Hourly</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.saveJobSummary('${jobId}')"><i class="fas fa-check"></i> Save</button>
      </div>
    `;
  }

  function saveJobSummary(jobId) {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) return;
    job.jobBrief = document.getElementById('editJobBrief')?.value?.trim() || '';
    job.responsibilities = (document.getElementById('editResponsibilities')?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
    job.jobRequirements = (document.getElementById('editJobRequirements')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    job.location = document.getElementById('editLocation')?.value?.trim() || job.location;
    job.experienceLevel = document.getElementById('editExperienceLevel')?.value || '';
    job.contractType = document.getElementById('editContractType')?.value || '';
    job.minSalary = document.getElementById('editMinSalary')?.value?.trim() || '';
    job.maxSalary = document.getElementById('editMaxSalary')?.value?.trim() || '';
    job.currency = document.getElementById('editCurrency')?.value?.trim() || 'SAR';
    job.frequency = document.getElementById('editFrequency')?.value || '';
    job.salary = (job.minSalary && job.maxSalary) ? `${job.minSalary} - ${job.maxSalary} ${job.currency}` : job.salary;
    closeModal();
    showJobHr(jobId, getJobHiringRequests(jobId)[0]?.id);
  }

  function showUserProfile(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">User Profile</div>
      <div class="modal-body user-profile-modal">
        <div class="user-profile-avatar"><span class="avatar" style="width:64px;height:64px;font-size:1.5rem;">${user.avatar}</span></div>
        <h3>${user.name}</h3>
        <p class="user-role">${user.role}</p>
        <dl class="user-details">
          <dt>Email</dt><dd>${user.email}</dd>
        </dl>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
        <button class="btn btn-primary"><i class="fas fa-envelope"></i> Message</button>
      </div>
    `;
  }

  function openCreateActivity(jobId) {
    const job = mockJobs.find(j => j.id === jobId);
    const jobCandIds = mockHiringRequests.filter(hr => hr.jobId === jobId).flatMap(hr => {
      const a = mockAssignments[hr.id] || {};
      return Object.values(a).flat();
    });
    const uniqueCandIds = [...new Set(jobCandIds)];
    const visibleCands = getVisibleCandidates();
    let candidates = uniqueCandIds.map(cid => mockCandidates.find(c => c.id === cid)).filter(Boolean);
    if (candidates.length === 0) candidates = [...visibleCands];
    const today = new Date().toISOString().slice(0, 10);

    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Create Activity</div>
      <div class="modal-body create-activity-body">
        <div class="activity-type-tabs">
          <button type="button" class="act-type-btn" data-type="call"><i class="fas fa-phone"></i> Call</button>
          <button type="button" class="act-type-btn" data-type="meeting"><i class="fas fa-users"></i> Meeting</button>
          <button type="button" class="act-type-btn" data-type="task"><i class="fas fa-tasks"></i> Task</button>
          <button type="button" class="act-type-btn" data-type="email"><i class="fas fa-envelope"></i> Email</button>
          <button type="button" class="act-type-btn active" data-type="interview"><i class="fas fa-video"></i> Interview</button>
        </div>
        <input type="hidden" id="actType" value="interview">
        <div class="form-group">
          <label>Add Title *</label>
          <input type="text" id="actTitle" placeholder="e.g. Interview with candidate">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="actDate" value="${today}">
          </div>
          <div class="form-group">
            <label>Start time</label>
            <input type="time" id="actStart" value="09:00">
          </div>
          <div class="form-group">
            <label>End time</label>
            <input type="time" id="actEnd" value="09:30">
          </div>
        </div>
        <div class="form-group">
          <label>Related to</label>
          <select id="actRelatedTo">
            <option value="">— Select candidate —</option>
            ${candidates.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Assignees</label>
          <select id="actAssignee">
            ${mockUsers.map(u => `<option value="${u.id}">${u.name}${u.id==='u1'?' (You)':''}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" id="actLocation" placeholder="Search location or enter address">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="actDesc" rows="3" placeholder="Add description"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitCreateActivity('${jobId}')">Continue</button>
      </div>
    `;

    modalContent.querySelectorAll('.act-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('.act-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('actType').value = btn.dataset.type;
      });
    });
  }

  function submitCreateActivity(jobId) {
    const title = document.getElementById('actTitle')?.value?.trim();
    if (!title) return alert('Please enter a title');
    const type = document.getElementById('actType')?.value || 'task';
    const relatedCandId = document.getElementById('actRelatedTo')?.value;
    const candidate = relatedCandId ? mockCandidates.find(c => c.id === relatedCandId) : null;
    const scheduledDate = document.getElementById('actDate')?.value || new Date().toISOString().slice(0, 10);
    const assigneeId = document.getElementById('actAssignee')?.value || 'u1';

    const newAct = {
      id: mockActivities.length + 1,
      type,
      title,
      jobId,
      candidateId: relatedCandId || null,
      relatedTo: candidate?.name || null,
      date: 'Just now',
      scheduledDate,
      status: 'scheduled',
      assigneeId,
      user: 'Muhammad'
    };
    mockActivities.unshift(newAct);
    closeModal();
    showJobHr(jobId, getJobHiringRequests(jobId)[0]?.id);
  }

  // --- MODALS ---
  function openCreateJob() {
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Create Job</div>
      <div class="modal-body">
        <div class="form-group">
          <label>Job Title</label>
          <div style="display:flex;gap:0.5rem;">
            <input type="text" id="jobTitle" placeholder="e.g. Nurse - Jeddah" style="flex:1">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('jobTitle').value='Registered Nurse - ICU Department. 5+ years experience required.'" title="AI Generate">AI</button>
          </div>
        </div>
        <div class="form-group">
          <label>Client</label>
          <select id="jobClient">
            ${mockClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Number Required</label>
          <input type="number" id="jobRequired" value="1">
        </div>
        <div class="form-group">
          <label>Nationality</label>
          <select id="jobNationality">
            <option value="">Any</option>
            <option value="Philippines">Philippines</option>
            <option value="India">India</option>
            <option value="Egypt">Egypt</option>
          </select>
        </div>
        <div class="form-group">
          <label>Skills (comma separated)</label>
          <input type="text" id="jobSkills" placeholder="ICU, Emergency, BLS">
        </div>
        <div class="form-group">
          <label>Salary Range</label>
          <input type="text" id="jobSalary" placeholder="SR 5,000 - 6,000 SAR">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" id="jobLocation" placeholder="Jeddah, Saudi Arabia">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitCreateJob()">Create</button>
      </div>
    `;
    modalOverlay.classList.remove('hidden');
  }

  function submitCreateJob() {
    const title = document.getElementById('jobTitle')?.value;
    if (!title) return alert('Please enter job title');
    const clientId = document.getElementById('jobClient')?.value;
    const client = mockClients.find(c => c.id === clientId);
    const reqCount = parseInt(document.getElementById('jobRequired')?.value || 1);
    const salaryVal = document.getElementById('jobSalary')?.value || '-';
    const newJob = {
      id: 'j' + (mockJobs.length + 1),
      title,
      clientId,
      clientName: client?.name || 'Unknown',
      required: reqCount,
      nationality: document.getElementById('jobNationality')?.value || '-',
      skills: (document.getElementById('jobSkills')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      salary: salaryVal,
      minSalary: '',
      maxSalary: '',
      currency: 'SAR',
      frequency: 'Monthly',
      location: document.getElementById('jobLocation')?.value || '-',
      status: 'active',
      priority: 'normal',
      owner: 'Muhammad',
      ownerAvatar: 'M',
      jobReference: 'JR-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      headcount: reqCount,
      contractType: 'Full-time',
      experienceLevel: '',
      remote: false,
      officeAddress: '',
      expectedCloseDate: '',
      jobBrief: '',
      responsibilities: [],
      jobRequirements: []
    };
    mockJobs.push(newJob);
    const firstHr = {
      id: 'hr' + (mockHiringRequests.length + 1),
      jobId: newJob.id,
      number: 'HR-001',
      assignedAgentId: 'u1',
      assignedAgentName: 'Muhammad',
      required: reqCount,
      filled: 0
    };
    mockHiringRequests.push(firstHr);
    mockAssignments[firstHr.id] = DEFAULT_STAGES.reduce((o, s) => { o[s] = []; return o; }, {});
    closeModal();
    showJobHr(newJob.id, firstHr.id);
  }

  function openCreateCandidate() {
    setActiveNav('candidates');
    renderAddCandidateForm();
  }

  function buildCandidateFormHtml() {
    const natOpts = (typeof mockNationalities !== 'undefined' ? mockNationalities : []).map(n => `<option value="${n.name}">${n.name}</option>`).join('');
    const agents = typeof mockAgents !== 'undefined' ? mockAgents : [];
    const agentOpts = '<option value="">— Select agent —</option>' + agents.map(a => `<option value="${a.id}">${a.name} (${a.code || ''})</option>`).join('');
    const currentAgentId = getCurrentUser()?.agentId || '';
    const agentField = isAdmin()
      ? `<div class="form-group"><label for="candAgentId">Agent <span class="required">*</span></label><select id="candAgentId" required>${agentOpts}</select></div>`
      : `<div class="form-group"><label for="candAgentId">Agent</label><select id="candAgentId" disabled>${agents.map(a => `<option value="${a.id}" ${a.id === currentAgentId ? 'selected' : ''}>${a.name} (${a.code || ''})</option>`).join('')}</select></div>`;
    return `
      <div class="cand-add-cv-section auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-file-upload"></i> Import from CV (optional)</h3>
        <p class="cand-add-hint">Upload a CV to auto-fill fields below. You can then edit any values.</p>
        <div class="form-group">
          <input type="file" id="candCvFile" accept=".pdf,.doc,.docx" class="cand-cv-input">
          <small class="form-hint">Accepted: PDF, DOC, DOCX</small>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-user"></i> Basic information</h3>
        <div class="auth-form-grid">
          ${agentField}
          <div class="form-group form-group-full">
            <label for="candName">Full Name <span class="required">*</span></label>
            <input type="text" id="candName" placeholder="e.g. Maria Santos" required>
          </div>
          <div class="form-group">
            <label for="candFirstName">First Name</label>
            <input type="text" id="candFirstName" placeholder="Auto-filled from Full Name">
          </div>
          <div class="form-group">
            <label for="candLastName">Last Name</label>
            <input type="text" id="candLastName" placeholder="Auto-filled from Full Name">
          </div>
          <div class="form-group">
            <label for="candTitle">Title / Profession</label>
            <input type="text" id="candTitle" placeholder="e.g. Registered Nurse">
          </div>
          <div class="form-group">
            <label for="candReference">Reference</label>
            <input type="text" id="candReference" placeholder="e.g. W5VW894Y9">
          </div>
          <div class="form-group">
            <label for="candGender">Gender</label>
            <select id="candGender">
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-address-card"></i> Contact &amp; location</h3>
        <div class="auth-form-grid">
          <div class="form-group form-group-full">
            <label for="candEmail">Email</label>
            <input type="email" id="candEmail" placeholder="candidate@example.com">
          </div>
          <div class="form-group">
            <label for="candPhone">Phone</label>
            <input type="tel" id="candPhone" placeholder="e.g. +639975880451">
          </div>
          <div class="form-group">
            <label for="candLocation">Location</label>
            <input type="text" id="candLocation" placeholder="e.g. Manila, Philippines">
          </div>
          <div class="form-group form-group-full">
            <label for="candAddress">Address</label>
            <input type="text" id="candAddress" placeholder="Full address">
          </div>
          <div class="form-group">
            <label for="candBirthdate">Birthdate</label>
            <input type="date" id="candBirthdate">
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-briefcase"></i> Professional details</h3>
        <div class="auth-form-grid">
          <div class="form-group">
            <label for="candNationality">Nationality</label>
            <select id="candNationality">
              <option value="">-- Select --</option>
              ${natOpts}
            </select>
          </div>
          <div class="form-group">
            <label for="candExperience">Years of experience</label>
            <input type="text" id="candExperience" placeholder="e.g. 5 years">
          </div>
          <div class="form-group">
            <label for="candCurrentCompany">Current company</label>
            <input type="text" id="candCurrentCompany" placeholder="e.g. Don Carlos Hospital">
          </div>
          <div class="form-group">
            <label for="candCurrentPosition">Current position</label>
            <input type="text" id="candCurrentPosition" placeholder="e.g. Registered Nurse">
          </div>
          <div class="form-group">
            <label for="candDiploma">Diploma / Qualification</label>
            <input type="text" id="candDiploma" placeholder="e.g. Nursing">
          </div>
          <div class="form-group form-group-full">
            <label for="candUniversity">University / Institution</label>
            <input type="text" id="candUniversity" placeholder="e.g. Central Mindanao University">
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-star"></i> Skills</h3>
        <div class="form-group">
          <label for="candSkills">Skills (comma separated)</label>
          <input type="text" id="candSkills" placeholder="ICU, Emergency care, Patient assessment">
          <small class="form-hint">Add multiple skills separated by commas. Rating defaults to 8.</small>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-info-circle"></i> Additional information</h3>
        <div class="auth-form-grid">
          <div class="form-group">
            <label for="candDepartment">Department</label>
            <input type="text" id="candDepartment" placeholder="e.g. ICU">
          </div>
          <div class="form-group">
            <label for="candIndustry">Industry</label>
            <input type="text" id="candIndustry" placeholder="e.g. Healthcare">
          </div>
          <div class="form-group">
            <label for="candGraduationDate">Graduation date</label>
            <input type="date" id="candGraduationDate">
          </div>
          <div class="form-group">
            <label for="candCurrentSalary">Current salary</label>
            <input type="text" id="candCurrentSalary" placeholder="e.g. 5000 SAR">
          </div>
          <div class="form-group">
            <label for="candExpectedSalary">Expected salary</label>
            <input type="text" id="candExpectedSalary" placeholder="e.g. 6000 SAR">
          </div>
          <div class="form-group">
            <label for="candNoticePeriod">Notice period</label>
            <input type="text" id="candNoticePeriod" placeholder="e.g. 1 month">
          </div>
          <div class="form-group">
            <label for="candNationalities">Nationalities (comma separated)</label>
            <input type="text" id="candNationalities" placeholder="Philippines, Saudi">
          </div>
          <div class="form-group">
            <label for="candLanguages">Languages</label>
            <input type="text" id="candLanguages" placeholder="e.g. English, Arabic">
          </div>
          <div class="form-group">
            <label for="candGdprConsent">GDPR consent</label>
            <select id="candGdprConsent">
              <option value="Pending" selected>Pending</option>
              <option value="Granted">Granted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
          <div class="form-group">
            <label for="candEmailConsent">Email consent</label>
            <select id="candEmailConsent">
              <option value="Pending" selected>Pending</option>
              <option value="Granted">Granted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
          <div class="form-group form-group-full">
            <label for="candDescription">Description / notes</label>
            <textarea id="candDescription" rows="3" placeholder="Additional notes about the candidate"></textarea>
          </div>
        </div>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-history"></i> Work experience</h3>
        <p class="cand-add-hint">Add previous work history. Leave blank if not needed.</p>
        <div id="candExpContainer" class="cand-repeatable-container">
          <div class="cand-exp-row cand-repeatable-row">
            <div class="auth-form-grid">
              <div class="form-group"><label>Role</label><input type="text" class="cand-exp-role" placeholder="e.g. Registered Nurse"></div>
              <div class="form-group"><label>Company</label><input type="text" class="cand-exp-company" placeholder="Company name"></div>
              <div class="form-group"><label>Start</label><input type="date" class="cand-exp-start"></div>
              <div class="form-group"><label>End</label><input type="date" class="cand-exp-end"></div>
              <div class="form-group"><label>Country</label><input type="text" class="cand-exp-country" placeholder="e.g. PH"></div>
              <div class="form-group" style="align-self:end;"><button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.cand-repeatable-row').remove()"><i class="fas fa-trash-alt"></i></button></div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="app.addCandExpRow()"><i class="fas fa-plus"></i> Add experience</button>
      </div>
      <div class="auth-form-section">
        <h3 class="auth-form-section-title"><i class="fas fa-graduation-cap"></i> Education</h3>
        <p class="cand-add-hint">Add education entries.</p>
        <div id="candEduContainer" class="cand-repeatable-container">
          <div class="cand-edu-row cand-repeatable-row">
            <div class="auth-form-grid">
              <div class="form-group form-group-full"><label>Institution</label><input type="text" class="cand-edu-institution" placeholder="e.g. Central Mindanao University"></div>
              <div class="form-group"><label>Degree</label><input type="text" class="cand-edu-degree" placeholder="e.g. Bachelor of Nursing"></div>
              <div class="form-group"><label>Start</label><input type="date" class="cand-edu-start"></div>
              <div class="form-group"><label>End</label><input type="date" class="cand-edu-end"></div>
              <div class="form-group"><label>Country</label><input type="text" class="cand-edu-country" placeholder="e.g. PH"></div>
              <div class="form-group" style="align-self:end;"><button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.cand-repeatable-row').remove()"><i class="fas fa-trash-alt"></i></button></div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="app.addCandEduRow()"><i class="fas fa-plus"></i> Add education</button>
      </div>
    `;
  }

  function addCandExpRow() {
    const container = document.getElementById('candExpContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'cand-exp-row cand-repeatable-row';
    row.innerHTML = `
      <div class="auth-form-grid">
        <div class="form-group"><label>Role</label><input type="text" class="cand-exp-role" placeholder="e.g. Registered Nurse"></div>
        <div class="form-group"><label>Company</label><input type="text" class="cand-exp-company" placeholder="Company name"></div>
        <div class="form-group"><label>Start</label><input type="date" class="cand-exp-start"></div>
        <div class="form-group"><label>End</label><input type="date" class="cand-exp-end"></div>
        <div class="form-group"><label>Country</label><input type="text" class="cand-exp-country" placeholder="e.g. PH"></div>
        <div class="form-group" style="align-self:end;"><button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.cand-repeatable-row').remove()"><i class="fas fa-trash-alt"></i></button></div>
      </div>
    `;
    container.appendChild(row);
  }

  function addCandEduRow() {
    const container = document.getElementById('candEduContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'cand-edu-row cand-repeatable-row';
    row.innerHTML = `
      <div class="auth-form-grid">
        <div class="form-group form-group-full"><label>Institution</label><input type="text" class="cand-edu-institution" placeholder="e.g. Central Mindanao University"></div>
        <div class="form-group"><label>Degree</label><input type="text" class="cand-edu-degree" placeholder="e.g. Bachelor of Nursing"></div>
        <div class="form-group"><label>Start</label><input type="date" class="cand-edu-start"></div>
        <div class="form-group"><label>End</label><input type="date" class="cand-edu-end"></div>
        <div class="form-group"><label>Country</label><input type="text" class="cand-edu-country" placeholder="e.g. PH"></div>
        <div class="form-group" style="align-self:end;"><button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.cand-repeatable-row').remove()"><i class="fas fa-trash-alt"></i></button></div>
      </div>
    `;
    container.appendChild(row);
  }

  function renderAddCandidateForm() {
    setActiveNav('candidates');
    const isConvert = !!_convertCvId;
    const cv = _convertCvId ? mockCVs.find(c => c.id === _convertCvId) : null;
    const pageTitle = isConvert ? 'Convert CV to Candidate' : 'Add Candidate';
    const subtitle = isConvert
      ? `Converting <strong>${(cv?.fileName || '').replace(/"/g, '&quot;')}</strong>. AI-parsed data is pre-filled below. Edit and submit.`
      : 'Enter candidate details. Required fields are marked with <span class="required">*</span>. You can import from CV to auto-fill.';
    render(`
      <div class="auth-edit-page cand-add-page">
        <nav class="auth-edit-breadcrumb">
          <a class="back-link" onclick="app.clearConvertCvId(); app.showView('cvs')"><i class="fas fa-arrow-left"></i> ${isConvert ? 'CVs' : 'Candidates'}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${pageTitle}</span>
        </nav>
        <div class="auth-edit-header">
          <h1 class="page-title">${pageTitle}</h1>
          <p class="auth-edit-subtitle">${subtitle}</p>
        </div>
        <form class="auth-edit-form cand-add-form" onsubmit="app.submitCreateCandidate(); return false;">
          <div class="auth-edit-body cand-add-body">
            ${buildCandidateFormHtml()}
          </div>
          <div class="auth-edit-actions">
            <button type="button" class="btn btn-secondary" onclick="app.clearConvertCvId(); app.showView('${isConvert ? 'cvs' : 'candidates'}')">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-plus"></i> ${isConvert ? 'Create Candidate' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    `);
    document.getElementById('candCvFile')?.addEventListener('change', () => {
      const n = document.getElementById('candName');
      const fn = document.getElementById('candFirstName');
      const ln = document.getElementById('candLastName');
      const t = document.getElementById('candTitle');
      const na = document.getElementById('candNationality');
      const ex = document.getElementById('candExperience');
      const sk = document.getElementById('candSkills');
      const comp = document.getElementById('candCurrentCompany');
      const pos = document.getElementById('candCurrentPosition');
      const univ = document.getElementById('candUniversity');
      const dip = document.getElementById('candDiploma');
      if (n) n.value = n.value || 'Maria Santos';
      if (fn) fn.value = fn.value || 'Maria';
      if (ln) ln.value = ln.value || 'Santos';
      if (t) t.value = t.value || 'Registered Nurse';
      if (na) na.value = na.value || 'Philippines';
      if (ex) ex.value = ex.value || '5 years';
      if (sk) sk.value = sk.value || 'ICU, Emergency care';
      if (comp) comp.value = comp.value || 'Sample Hospital';
      if (pos) pos.value = pos.value || 'Staff Nurse';
      if (univ) univ.value = univ.value || 'University of the Philippines';
      if (dip) dip.value = dip.value || 'Nursing';
    });
    document.getElementById('candName')?.addEventListener('blur', () => {
      const name = (document.getElementById('candName')?.value || '').trim();
      if (!name) return;
      const parts = name.split(' ').filter(Boolean);
      const fn = document.getElementById('candFirstName');
      const ln = document.getElementById('candLastName');
      if (fn && !fn.value) fn.value = parts[0] || '';
      if (ln && !ln.value) ln.value = parts.slice(1).join(' ') || '';
    });
    if (_convertCvId) prefillCandidateFormFromCv(_convertCvId);
  }

  function clearConvertCvId() {
    _convertCvId = null;
  }

  function submitCreateCandidate() {
    const name = (document.getElementById('candName')?.value || '').trim();
    if (!name) return alert('Please enter candidate name');
    const avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const skillsInput = (document.getElementById('candSkills')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const skills = skillsInput.map(s => (typeof s === 'string' ? { name: s, rating: 8 } : s));

    const expRows = document.querySelectorAll('.cand-exp-row');
    const experience = [];
    expRows.forEach(row => {
      const role = row.querySelector('.cand-exp-role')?.value?.trim();
      const company = row.querySelector('.cand-exp-company')?.value?.trim();
      if (role || company) {
        const start = row.querySelector('.cand-exp-start')?.value || '';
        const end = row.querySelector('.cand-exp-end')?.value || '';
        experience.push({
          role: role || '-',
          company: company || '-',
          start, end,
          years: start && end ? '' : '',
          country: row.querySelector('.cand-exp-country')?.value || ''
        });
      }
    });

    const eduRows = document.querySelectorAll('.cand-edu-row');
    const education = [];
    eduRows.forEach(row => {
      const institution = row.querySelector('.cand-edu-institution')?.value?.trim();
      if (institution) {
        education.push({
          institution,
          degree: row.querySelector('.cand-edu-degree')?.value || '',
          start: row.querySelector('.cand-edu-start')?.value || '',
          end: row.querySelector('.cand-edu-end')?.value || '',
          country: row.querySelector('.cand-edu-country')?.value || ''
        });
      }
    });

    const v = id => (document.getElementById(id)?.value || '').trim();
    const expStr = v('candExperience');
    const natList = v('candNationalities') ? v('candNationalities').split(',').map(s => s.trim()).filter(Boolean) : [];
    const langList = v('candLanguages') ? v('candLanguages').split(',').map(s => s.trim()).filter(Boolean) : [];

    const selectedAgentId = (document.getElementById('candAgentId')?.value || '').trim();
    const agentId = isAdmin() ? (selectedAgentId || null) : (getCurrentUser()?.agentId || null);
    if (isAdmin() && !agentId) return alert('Please select an agent.');
    const newC = {
      id: 'ca' + (mockCandidates.length + 1),
      agentId,
      name: name.toUpperCase(),
      firstName: v('candFirstName') || name.split(' ')[0] || '',
      lastName: v('candLastName') || name.split(' ').slice(1).join(' ') || '',
      title: v('candTitle') || '-',
      nationality: v('candNationality') || '-',
      experience: experience.length ? experience : expStr || '-',
      experienceYears: parseInt(expStr) || 0,
      skills,
      status: 'available',
      avatar,
      tags: [],
      reference: v('candReference'),
      gender: v('candGender'),
      diploma: v('candDiploma'),
      university: v('candUniversity'),
      currentCompany: v('candCurrentCompany'),
      currentPosition: v('candCurrentPosition'),
      location: v('candLocation'),
      birthdate: v('candBirthdate'),
      address: v('candAddress'),
      email: v('candEmail'),
      phone: v('candPhone'),
      department: v('candDepartment'),
      industry: v('candIndustry'),
      graduationDate: v('candGraduationDate'),
      currentSalary: v('candCurrentSalary'),
      expectedSalary: v('candExpectedSalary'),
      noticePeriod: v('candNoticePeriod'),
      nationalities: natList,
      languages: langList,
      gdprConsent: v('candGdprConsent') || 'Pending',
      emailConsent: v('candEmailConsent') || 'Pending',
      description: v('candDescription'),
      employmentStatus: '',
      hiredDate: '',
      startDate: '',
      probationEndDate: '',
      leftDate: '',
      employeeJob: '',
      employeeClient: '',
      education,
      createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      createdBy: getCurrentUser()?.name || '',
      lastUpdated: '',
      resumeCount: 0,
      inboxCount: 0,
      jobsCount: 0
    };
    mockCandidates.push(newC);
    if (_convertCvId) {
      const cv = mockCVs.find(c => c.id === _convertCvId);
      if (cv) {
        cv.status = 'converted';
        cv.candidateId = newC.id;
      }
      _convertCvId = null;
      showCandidate(newC.id);
      setTimeout(() => { if (getVisibleHiringRequests().length) openAssignToHr(newC.id); }, 100);
    } else {
      showCandidate(newC.id);
    }
  }

  function assignToHrFromMatches(candidateId) {
    const hrId = document.getElementById('matchHrSelect')?.value;
    if (!hrId) return;
    assignToHiringRequest(hrId, candidateId);
    const jobId = document.getElementById('matchJobSelect')?.value;
    renderMatches(jobId);
  }

  function assignToHiringRequest(hrId, candidateId) {
    const a = mockAssignments[hrId];
    if (!a) return;
    const hr = mockHiringRequests.find(h => h.id === hrId);
    if (!hr) return;
    const candidate = mockCandidates.find(c => c.id === candidateId);
    if (!candidate) return;
    // Prevent duplicate assignment: candidate cannot be assigned to multiple jobs simultaneously
    const existing = getCandidateActiveAssignment(candidateId);
    if (existing && existing.hrId !== hrId) {
      const jobTitle = mockJobs.find(j => j.id === existing.jobId)?.title || 'another job';
      alert('This candidate cannot be assigned to multiple jobs. They are already assigned to: ' + jobTitle + '. Unassign them there first.');
      return;
    }
    // Agent can only assign their own candidates (admin can assign any)
    if (!isAdmin()) {
      const u = getCurrentUser();
      if (candidate.agentId !== u?.agentId) {
        alert('You can only assign candidates that belong to your agent.');
        return;
      }
      const hrUser = mockUsers.find(x => x.id === hr.assignedAgentId);
      if (hrUser?.agentId !== u?.agentId) {
        alert('You can only assign candidates to hiring requests assigned to your agent.');
        return;
      }
    }
    const stages = getStagesForHiringRequest(hrId);
    const firstStage = stages.find(s => s !== 'Placed' && s !== 'Rejected') || 'Sourcing';
    if (!a[firstStage]) a[firstStage] = [];
    if (!a[firstStage].includes(candidateId)) a[firstStage].push(candidateId);
    // Ensure candidate belongs to one agent: set from HR's agent if missing
    const hrUser = mockUsers.find(x => x.id === hr.assignedAgentId);
    if (hrUser?.agentId && !candidate.agentId) {
      candidate.agentId = hrUser.agentId;
    }
  }

  function showJobHr(jobId, hrId) {
    setActiveNav('jobs');
    renderJobProfile(jobId, hrId);
  }

  function openAddHiringRequest(jobId) {
    const job = mockJobs.find(j => j.id === jobId);
    const hrs = getJobHiringRequests(jobId);
    const nextNum = 'HR-' + String(hrs.length + 1).padStart(3, '0');
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Add Hiring Request</div>
      <div class="modal-body add-hr-body">
        <p><strong>Job:</strong> ${job?.title || ''}</p>
        <div class="form-group">
          <label>Hiring Request Number</label>
          <input type="text" id="hrNumber" value="${nextNum}" readonly>
        </div>
        <div class="form-group">
          <label>VISA Number <span class="required">*</span></label>
          <input type="text" id="hrVisaNumber" placeholder="Enter VISA number">
        </div>
        <div class="form-group">
          <label>Contract Duration (months) <span class="required">*</span></label>
          <select id="hrContractDuration">
            <option value="3">3</option>
            <option value="6">6</option>
            <option value="12" selected>12</option>
            <option value="24">24</option>
          </select>
        </div>
        <div class="form-group">
          <label>Agent Authorization <span class="required">*</span></label>
          <select id="hrAgentAuthorization">
            <option value="">-- Select --</option>
            ${(typeof mockAgentAuthorizations !== 'undefined' ? mockAgentAuthorizations : []).map(aa => `<option value="${aa.id}">${aa.code}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Assigned Agent</label>
          <select id="hrAgent">
            ${mockUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Required Candidates Count</label>
          <input type="number" id="hrRequired" value="1" min="1">
        </div>
        <div class="form-section-title">Salary &amp; Allowances</div>
        <div class="salary-fields">
          <div class="form-group salary-field">
            <label>Basic Salary <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrBasicSalary" value="1000.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Housing <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrHousing" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Transportation <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrTransportation" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Food <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrFood" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Allowance of the nature of the work <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrAllowanceNature" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Additional allowance <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrAdditionalAllowance" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Overtime <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrOvertime" value="0.00" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field salary-total">
            <label>Total Salary</label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="text" id="hrTotalSalary" value="1,000.00" readonly>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitAddHiringRequest('${jobId}')">Add</button>
      </div>
    `;
    initAddHrSalaryCalc();
  }

  function initAddHrSalaryCalc() {
    const inputs = modalContent.querySelectorAll('[data-salary]');
    const totalEl = document.getElementById('hrTotalSalary');
    if (!totalEl) return;
    function updateTotal() {
      let sum = 0;
      inputs.forEach(inp => { sum += parseFloat(inp.value) || 0; });
      totalEl.value = sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    inputs.forEach(inp => inp.addEventListener('input', updateTotal));
    updateTotal();
  }

  function submitAddHiringRequest(jobId) {
    const number = document.getElementById('hrNumber')?.value || 'HR-001';
    const visaNumber = document.getElementById('hrVisaNumber')?.value || '';
    const contractDuration = parseInt(document.getElementById('hrContractDuration')?.value || 12);
    const agentAuthId = document.getElementById('hrAgentAuthorization')?.value;
    const agentAuth = (typeof mockAgentAuthorizations !== 'undefined' ? mockAgentAuthorizations : []).find(aa => aa.id === agentAuthId);
    const agentId = document.getElementById('hrAgent')?.value;
    const agent = mockUsers.find(u => u.id === agentId);
    const required = parseInt(document.getElementById('hrRequired')?.value || 1);
    const basicSalary = parseFloat(document.getElementById('hrBasicSalary')?.value || 0);
    const housing = parseFloat(document.getElementById('hrHousing')?.value || 0);
    const transportation = parseFloat(document.getElementById('hrTransportation')?.value || 0);
    const food = parseFloat(document.getElementById('hrFood')?.value || 0);
    const allowanceNature = parseFloat(document.getElementById('hrAllowanceNature')?.value || 0);
    const additionalAllowance = parseFloat(document.getElementById('hrAdditionalAllowance')?.value || 0);
    const overtime = parseFloat(document.getElementById('hrOvertime')?.value || 0);
    const totalSalary = basicSalary + housing + transportation + food + allowanceNature + additionalAllowance + overtime;
    const newHr = {
      id: 'hr' + (mockHiringRequests.length + 1),
      jobId,
      number,
      visaNumber,
      contractDurationMonths: contractDuration,
      agentAuthorizationId: agentAuthId,
      agentAuthorizationName: agentAuth?.name || '',
      assignedAgentId: agentId,
      assignedAgentName: agent?.name || 'Unknown',
      required,
      filled: 0,
      basicSalary,
      housing,
      transportation,
      food,
      allowanceNatureOfWork: allowanceNature,
      additionalAllowance,
      overtime,
      totalSalary
    };
    mockHiringRequests.push(newHr);
    mockAssignments[newHr.id] = DEFAULT_STAGES.reduce((o, s) => { o[s] = []; return o; }, {});
    closeModal();
    showJobHr(jobId, newHr.id);
  }

  function openEditHiringRequest(hrId) {
    const hr = mockHiringRequests.find(h => h.id === hrId);
    if (!hr) return;
    const job = mockJobs.find(j => j.id === hr.jobId);
    const cd = hr.contractDurationMonths || 12;
    const authOptions = (typeof mockAgentAuthorizations !== 'undefined' ? mockAgentAuthorizations : [])
      .map(aa => `<option value="${aa.id}" ${(hr.agentAuthorizationId === aa.id) ? 'selected' : ''}>${aa.code}</option>`).join('');
    const agentOptions = mockUsers.map(u => `<option value="${u.id}" ${(hr.assignedAgentId === u.id) ? 'selected' : ''}>${u.name}</option>`).join('');
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Edit Hiring Request</div>
      <div class="modal-body add-hr-body">
        <p><strong>Job:</strong> ${job?.title || ''}</p>
        <div class="form-group">
          <label>Hiring Request Number</label>
          <input type="text" id="hrNumber" value="${(hr.number || '').replace(/"/g, '&quot;')}" readonly>
        </div>
        <div class="form-group">
          <label>VISA Number <span class="required">*</span></label>
          <input type="text" id="hrVisaNumber" placeholder="Enter VISA number" value="${(hr.visaNumber || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-group">
          <label>Contract Duration (months) <span class="required">*</span></label>
          <select id="hrContractDuration">
            <option value="3" ${cd === 3 ? 'selected' : ''}>3</option>
            <option value="6" ${cd === 6 ? 'selected' : ''}>6</option>
            <option value="12" ${cd === 12 ? 'selected' : ''}>12</option>
            <option value="24" ${cd === 24 ? 'selected' : ''}>24</option>
          </select>
        </div>
        <div class="form-group">
          <label>Agent Authorization <span class="required">*</span></label>
          <select id="hrAgentAuthorization">
            <option value="">-- Select --</option>
            ${authOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Assigned Agent</label>
          <select id="hrAgent">
            ${agentOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Required Candidates Count</label>
          <input type="number" id="hrRequired" value="${hr.required || 1}" min="1">
        </div>
        <div class="form-section-title">Salary &amp; Allowances</div>
        <div class="salary-fields">
          <div class="form-group salary-field">
            <label>Basic Salary <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrBasicSalary" value="${hr.basicSalary ?? 1000}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Housing <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrHousing" value="${hr.housing ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Transportation <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrTransportation" value="${hr.transportation ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Food <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrFood" value="${hr.food ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Allowance of the nature of the work <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrAllowanceNature" value="${hr.allowanceNatureOfWork ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Additional allowance <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrAdditionalAllowance" value="${hr.additionalAllowance ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field">
            <label>Overtime <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="number" id="hrOvertime" value="${hr.overtime ?? 0}" step="0.01" min="0" data-salary>
            </div>
          </div>
          <div class="form-group salary-field salary-total">
            <label>Total Salary</label>
            <div class="input-with-icon">
              <i class="fas fa-lock salary-lock"></i>
              <input type="text" id="hrTotalSalary" value="" readonly>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitEditHiringRequest('${hrId}')">Save</button>
      </div>
    `;
    initAddHrSalaryCalc();
  }

  function submitEditHiringRequest(hrId) {
    const hr = mockHiringRequests.find(h => h.id === hrId);
    if (!hr) return;
    const visaNumber = document.getElementById('hrVisaNumber')?.value || '';
    const contractDuration = parseInt(document.getElementById('hrContractDuration')?.value || 12);
    const agentAuthId = document.getElementById('hrAgentAuthorization')?.value;
    const agentAuth = (typeof mockAgentAuthorizations !== 'undefined' ? mockAgentAuthorizations : []).find(aa => aa.id === agentAuthId);
    const agentId = document.getElementById('hrAgent')?.value;
    const agent = mockUsers.find(u => u.id === agentId);
    const required = parseInt(document.getElementById('hrRequired')?.value || 1);
    const basicSalary = parseFloat(document.getElementById('hrBasicSalary')?.value || 0);
    const housing = parseFloat(document.getElementById('hrHousing')?.value || 0);
    const transportation = parseFloat(document.getElementById('hrTransportation')?.value || 0);
    const food = parseFloat(document.getElementById('hrFood')?.value || 0);
    const allowanceNature = parseFloat(document.getElementById('hrAllowanceNature')?.value || 0);
    const additionalAllowance = parseFloat(document.getElementById('hrAdditionalAllowance')?.value || 0);
    const overtime = parseFloat(document.getElementById('hrOvertime')?.value || 0);
    const totalSalary = basicSalary + housing + transportation + food + allowanceNature + additionalAllowance + overtime;
    Object.assign(hr, {
      visaNumber,
      contractDurationMonths: contractDuration,
      agentAuthorizationId: agentAuthId,
      agentAuthorizationName: agentAuth?.name || '',
      assignedAgentId: agentId,
      assignedAgentName: agent?.name || 'Unknown',
      required,
      basicSalary,
      housing,
      transportation,
      food,
      allowanceNatureOfWork: allowanceNature,
      additionalAllowance,
      overtime,
      totalSalary
    });
    closeModal();
    const currentView = document.querySelector('.nav-item.active')?.dataset?.view;
    if (currentView === 'hiringRequests') renderHiringRequests();
    else if (currentView === 'jobs' || hr?.jobId) renderJobProfile(hr.jobId, hrId);
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  // --- VIEW ROUTER ---
  function showView(view, param) {
    if ((view === 'users' || view === 'agents' || view === 'taeed' || view === 'issuedVisa') && !isAdmin()) {
      return showView('dashboard');
    }
    setActiveNav(view);
    if (view === 'dashboard') {
      if (param === 'hiring-stages') dashboardTab = 'hiring-stages';
      else if (param === 'agent-performance') dashboardTab = 'agent-performance';
      else dashboardTab = 'general';
      renderDashboard();
    }
    else if (view === 'jobs') param ? renderJobProfile(param) : renderJobsList();
    else if (view === 'authorizations') renderAuthorizations();
    else if (view === 'hiringRequests') renderHiringRequests();
    else if (view === 'candidates') param === 'add' ? renderAddCandidateForm() : (param ? renderCandidateProfile(param) : renderCandidatesList());
    else if (view === 'cvs') renderCVs();
    else if (view === 'matches') renderMatches(param);
    else if (view === 'placements') renderPlacements();
    else if (view === 'clients') renderClients(param);
    else if (view === 'activities') renderActivities();
    else if (view === 'inbox') renderInbox();
    else if (view === 'aicenter') renderAICenter();
    else if (view === 'sourcing') renderSourcing();
    else if (view === 'userGuide') renderUserGuide();
    else if (view === 'reports') renderReports();
    else if (view === 'settings') renderSettings();
    else if (view === 'hiringStagesSettings') renderHiringStagesSettings();
    else if (view === 'users') renderUsers();
    else if (view === 'agents') param ? renderAgentProfile(param) : renderAgents();
    else if (view === 'taeed') param ? renderTaeedProfile(param) : renderTaeedsList();
    else if (view === 'issuedVisa') param ? renderIssuedVisaHeaderProfile(param) : renderIssuedVisaList();
  }

  // --- INIT ---
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const user = login(email, password);
    if (user) {
      setCurrentUser(user);
      showApp();
    } else {
      alert('Invalid email or password');
    }
  });

  document.getElementById('btnLogout')?.addEventListener('click', () => {
    logout();
  });

  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showView(el.dataset.view);
    });
  });

  document.getElementById('btnQuickCreate')?.addEventListener('click', () => {
    modalContent.innerHTML = `
      <div class="modal-header">Quick Create</div>
      <div class="modal-body">
        <button class="btn btn-primary" style="width:100%;margin-bottom:0.5rem;" onclick="app.closeModal(); app.openCreateJob();">Create Job</button>
        <button class="btn btn-primary" style="width:100%;margin-bottom:0.5rem;" onclick="app.closeModal(); app.showView('candidates','add');">Add Candidate</button>
        <button class="btn btn-primary" style="width:100%;" onclick="app.closeModal(); app.openCreateClient();">Add Client</button>
      </div>
    `;
    modalOverlay.classList.remove('hidden');
  });

  document.getElementById('globalSearch')?.addEventListener('keypress', (e) => {
    if (e.key !== 'Enter') return;
    const q = (e.target.value || '').toLowerCase().trim();
    if (q.length < 2) return;
    const jobsToSearch = getVisibleJobs();
    const jobMatch = jobsToSearch.find(j => j.title.toLowerCase().includes(q) || j.clientName.toLowerCase().includes(q));
    const candMatch = mockCandidates.find(c => c.name.toLowerCase().includes(q));
    const clientMatch = mockClients.find(c => c.name.toLowerCase().includes(q));
    if (jobMatch) { showJob(jobMatch.id); e.target.value = ''; }
    else if (candMatch) { showView('candidates', candMatch.id); e.target.value = ''; }
    else if (clientMatch) { showView('clients', clientMatch.id); e.target.value = ''; }
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function openCreateClient() {
    modalOverlay.classList.remove('hidden');
    modalContent.innerHTML = `
      <div class="modal-header">Add Client</div>
      <div class="modal-body">
        <div class="form-group"><label>Client Name</label><input type="text" id="clientName" placeholder="e.g. Hospital Name"></div>
        <div class="form-group"><label>Industry</label><input type="text" id="clientIndustry" placeholder="e.g. Healthcare"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="app.submitCreateClient()">Add</button>
      </div>
    `;
  }

  function submitCreateClient() {
    const name = document.getElementById('clientName')?.value;
    if (!name) return alert('Please enter client name');
    mockClients.push({ id: 'c' + (mockClients.length + 1), name, industry: document.getElementById('clientIndustry')?.value || '-', status: 'active', logo: name.charAt(0), location: '' });
    closeModal();
    showView('clients');
  }

  // Expose app API
  window.app = {
    showView,
    showJob: (id) => { setActiveNav('jobs'); renderJobProfile(id); },
    showJobHr,
    showCandidate: (id) => showView('candidates', id),
    showClient: (id) => showView('clients', id),
    showAgent: (id) => showView('agents', id),
    showTaeed,
    showIssuedVisaHeader,
    openIssuedVisaDetailForm,
    saveIssuedVisaDetailForm,
    openTaeedDetailForm,
    saveTaeedDetailForm,
    showTaeedDetailVisaDashboard,
    showIssuedVisaDetailDashboard,
    clearTaeedDetailSelection,
    clearIssuedVisaDetailSelection,
    openCreateJob,
    openCreateClient,
    openCreateCandidate,
    closeModal,
    submitCreateJob,
    submitCreateCandidate,
    submitCreateClient,
    renderMatchesView: (jobId) => renderMatches(jobId),
    assignToHiringRequest,
    openAddHiringRequest,
    submitAddHiringRequest,
    openEditHiringRequest,
    submitEditHiringRequest,
    openAddAuthorization,
    submitAddAuthorization,
    renderEditAuthorization,
    submitEditAuthorization,
    openAddUser,
    submitAddUser,
    openEditUser,
    submitEditUser,
    openAddAgent,
    submitAddAgent,
    openEditAgent,
    submitEditAgent,
    updateAgentCityDropdown,
    updateStageActivityDate,
    logout,
    getCurrentUser,
    isAdmin,
    applyDashboardStageFilters,
    submitHiringStagesTargetDays,
    applyBulkStageChange,
    submitBulkUpdateCandidates,
    editJobSummary,
    saveJobSummary,
    showUserProfile,
    runAIMatching,
    refreshAIRecsTab,
    openCreateActivity,
    submitCreateActivity,
    openCreateActivityFromPage,
    updateActivityStatus,
    openUploadCV,
    submitUploadCV,
    openConvertCvToCandidate,
    parseCvAi,
    submitConvertCvToCandidate,
    openAssignToHr,
    updateAssignHrOptions,
    submitAssignToHr,
    addCandExpRow,
    addCandEduRow,
    clearConvertCvId,
    openCandidateStageLogs,
    openDashboardStageDetails,
    changePerfAgent: (id) => { dashboardPerfAgentId = id || ''; renderDashboard(); }
  };

  if (getCurrentUser()) {
    showApp();
  } else {
    document.getElementById('loginScreen')?.classList.remove('hidden');
    document.getElementById('appScreen')?.classList.add('hidden');
  }
})();
