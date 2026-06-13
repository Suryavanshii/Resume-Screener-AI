document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements - API Config
    const geminiApiKey = document.getElementById("geminiApiKey");
    const toggleKeyVis = document.getElementById("toggleKeyVis");
    const apiStatus = document.getElementById("apiStatus");
    const modeTitle = document.getElementById("modeTitle");
    const modeDesc = document.getElementById("modeDesc");

    // DOM Elements - Form
    const screenerForm = document.getElementById("screenerForm");
    const resumeFile = document.getElementById("resumeFile");
    const dropzone = document.getElementById("dropzone");
    const filePreview = document.getElementById("filePreview");
    const removeFileBtn = document.getElementById("removeFileBtn");
    const previewIcon = document.getElementById("previewIcon");
    const previewName = document.getElementById("previewName");
    const previewSize = document.getElementById("previewSize");
    const jobDescription = document.getElementById("jobDescription");
    const charCounter = document.getElementById("charCounter");
    const submitBtn = document.getElementById("submitBtn");
    const btnSpinner = document.getElementById("btnSpinner");
    const btnArrow = document.getElementById("btnArrow");

    // DOM Elements - Results
    const resultsPanel = document.getElementById("resultsPanel");
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const resultsContent = document.getElementById("resultsContent");
    const scoreCircle = document.getElementById("scoreCircle");
    const scoreNumber = document.getElementById("scoreNumber");
    const scoreStatus = document.getElementById("scoreStatus");
    const resultModeTag = document.getElementById("resultModeTag");
    const candName = document.getElementById("candName");
    const candEmail = document.getElementById("candEmail");
    const candPhone = document.getElementById("candPhone");
    const candLinks = document.getElementById("candLinks");
    const matchedCount = document.getElementById("matchedCount");
    const matchedSkillsTags = document.getElementById("matchedSkillsTags");
    const missingCount = document.getElementById("missingCount");
    const missingSkillsTags = document.getElementById("missingSkillsTags");
    const strengthsList = document.getElementById("strengthsList");
    const weaknessesList = document.getElementById("weaknessesList");
    const recommendationsList = document.getElementById("recommendationsList");
    const questionsList = document.getElementById("questionsList");
    const questionsBadge = document.getElementById("questionsBadge");

    // State variables
    let selectedFile = null;
    let hasSystemKey = false;

    // Fetch config on load
    async function checkSystemKey() {
        try {
            const response = await fetch("/api/config");
            if (response.ok) {
                const data = await response.json();
                hasSystemKey = data.has_api_key;
                updateScanMode();
            }
        } catch (error) {
            console.error("Failed to check system config:", error);
        }
    }
    checkSystemKey();

    // --- API Key Visibility & Mode Handlers ---
    toggleKeyVis.addEventListener("click", () => {
        const type = geminiApiKey.type === "password" ? "text" : "password";
        geminiApiKey.type = type;
        const icon = toggleKeyVis.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });

    function updateScanMode() {
        const key = geminiApiKey.value.trim();
        const dot = apiStatus.querySelector(".status-dot");
        const statusText = apiStatus.querySelector(".status-text");

        if (key) {
            dot.className = "status-dot purple";
            statusText.textContent = "Deep AI Scan Enabled";
            modeTitle.textContent = "Deep AI Scan Mode";
            modeDesc.textContent = "Ready! Using Gemini 1.5 Flash to generate expert-level match scores, deep gap analysis, and tailored interview prep.";
        } else if (hasSystemKey) {
            dot.className = "status-dot purple";
            statusText.textContent = "Deep AI Scan Enabled";
            modeTitle.textContent = "Deep AI Scan Mode (System Key)";
            modeDesc.textContent = "Ready! Using configured system Gemini API Key to generate expert-level match scores, deep gap analysis, and tailored interview prep.";
        } else {
            dot.className = "status-dot green";
            statusText.textContent = "Quick Local Scan";
            modeTitle.textContent = "Quick NLP Mode";
            modeDesc.textContent = "Running local keyword matching. Paste a Gemini API Key above to unlock deep AI evaluation & interview prep.";
        }
    }
    
    geminiApiKey.addEventListener("input", updateScanMode);

    // --- Drag and Drop Handlers ---
    ["dragenter", "dragover"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        }, false);
    });

    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFileSelection(files[0]);
        }
    });

    resumeFile.addEventListener("change", (e) => {
        if (e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    });

    removeFileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetFileSelection();
    });

    function handleFileSelection(file) {
        // Validate type
        const allowedExtensions = /(\.pdf|\.docx|\.txt|\.md)$/i;
        if (!allowedExtensions.exec(file.name)) {
            alert("Please upload a PDF, DOCX, TXT, or MD file.");
            return;
        }

        selectedFile = file;
        
        // Update file input files list manually (important for standard form submissions)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        resumeFile.files = dataTransfer.files;

        // Visual configurations
        previewName.textContent = file.name;
        previewSize.textContent = formatBytes(file.size);
        
        // Choose icon
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            previewIcon.className = "fa-solid fa-file-pdf file-type-icon";
            previewIcon.style.color = "#ff4a4a";
        } else if (ext === 'docx') {
            previewIcon.className = "fa-solid fa-file-word file-type-icon";
            previewIcon.style.color = "#2b579a";
        } else {
            previewIcon.className = "fa-solid fa-file-lines file-type-icon";
            previewIcon.style.color = "#a78bfa";
        }

        // Display switcher
        dropzone.querySelector(".dropzone-content").style.display = "none";
        filePreview.style.display = "flex";
    }

    function resetFileSelection() {
        selectedFile = null;
        resumeFile.value = "";
        dropzone.querySelector(".dropzone-content").style.display = "block";
        filePreview.style.display = "none";
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- Job Description character count ---
    jobDescription.addEventListener("input", () => {
        charCounter.textContent = `${jobDescription.value.length} characters`;
    });

    // --- Form Submit and Call Backend API ---
    screenerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please upload a resume file.");
            return;
        }

        const jobDescValue = jobDescription.value.trim();
        if (!jobDescValue) {
            alert("Please enter a job description.");
            return;
        }

        // Toggle loading layouts
        emptyState.style.display = "none";
        resultsContent.style.display = "none";
        loadingState.style.display = "block";

        submitBtn.disabled = true;
        btnSpinner.style.display = "inline-block";
        btnArrow.style.display = "none";

        // Prepare FormData
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("job_description", jobDescValue);
        
        const apiKeyVal = geminiApiKey.value.trim();
        if (apiKeyVal) {
            formData.append("api_key", apiKeyVal);
        }

        try {
            const response = await fetch("/api/screen", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to screen the resume.");
            }

            const data = await response.json();
            renderResults(data);

        } catch (error) {
            console.error("Screening error:", error);
            alert(`Error: ${error.message}`);
            
            // Revert state
            loadingState.style.display = "none";
            emptyState.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            btnSpinner.style.display = "none";
            btnArrow.style.display = "inline-block";
        }
    });

    // --- Render Results to UI ---
    function renderResults(data) {
        // Hide loader, show contents
        loadingState.style.display = "none";
        resultsContent.style.display = "block";

        // 1. Mode tag
        resultModeTag.textContent = data.mode || "Screening Scan";
        
        // 2. Score Circle Animation
        const targetScore = data.match_score || 0;
        animateScore(targetScore);

        // 3. Score Rating Text
        if (targetScore >= 80) {
            scoreStatus.textContent = "Strong Match";
            scoreStatus.style.color = "var(--success)";
            scoreCircle.style.stroke = "var(--success)";
        } else if (targetScore >= 60) {
            scoreStatus.textContent = "Good Match";
            scoreStatus.style.color = "var(--warning)";
            scoreCircle.style.stroke = "var(--warning)";
        } else {
            scoreStatus.textContent = "Low Match";
            scoreStatus.style.color = "var(--danger)";
            scoreCircle.style.stroke = "var(--danger)";
        }

        // 4. Profile Details
        const info = data.candidate_info || {};
        candName.textContent = info.name || "Not found";
        candEmail.textContent = info.email || "Not found";
        candPhone.textContent = info.phone || "Not found";
        
        // Clear and rebuild links
        candLinks.innerHTML = "";
        if (info.links && info.links.length > 0) {
            info.links.forEach(link => {
                const isGithub = link.toLowerCase().includes("github.com");
                const isLinkedin = link.toLowerCase().includes("linkedin.com");
                const cleanText = link.replace(/^(https?:\/\/)?(www\.)?/, "");
                
                const a = document.createElement("a");
                a.href = link.startsWith("http") ? link : `https://${link}`;
                a.target = "_blank";
                a.className = "profile-link";
                
                let iconClass = "fa-solid fa-link";
                if (isGithub) iconClass = "fa-brands fa-github";
                if (isLinkedin) iconClass = "fa-brands fa-linkedin";
                
                a.innerHTML = `<i class="${iconClass}"></i> ${cleanText}`;
                candLinks.appendChild(a);
            });
        } else {
            candLinks.textContent = "No links detected";
        }

        // 5. Skills Tags
        const skills = data.skills_analysis || { matched: [], missing: [] };
        
        // Matched skills
        matchedCount.textContent = skills.matched ? skills.matched.length : 0;
        matchedSkillsTags.innerHTML = "";
        if (skills.matched && skills.matched.length > 0) {
            skills.matched.forEach(skill => {
                const span = document.createElement("span");
                span.className = "tag tag-matched";
                span.textContent = skill;
                matchedSkillsTags.appendChild(span);
            });
        } else {
            matchedSkillsTags.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">None detected</span>`;
        }

        // Missing skills
        missingCount.textContent = skills.missing ? skills.missing.length : 0;
        missingSkillsTags.innerHTML = "";
        if (skills.missing && skills.missing.length > 0) {
            skills.missing.forEach(skill => {
                const span = document.createElement("span");
                span.className = "tag tag-missing";
                span.textContent = skill;
                missingSkillsTags.appendChild(span);
            });
        } else {
            missingSkillsTags.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">No missing skills flagged</span>`;
        }

        // 6. ATS Gap Analysis List Bullets
        const evalData = data.evaluation || { strengths: [], weaknesses: [], recommendations: [] };
        
        buildBulletList(strengthsList, evalData.strengths || ["Meets basic formatting guidelines."]);
        buildBulletList(weaknessesList, evalData.weaknesses || ["Lack of explicit keywords matching the job role."]);
        buildBulletList(recommendationsList, evalData.recommendations || ["Tailor the work description list to use active resume verbs."]);

        // 7. Interview Prep Questions
        questionsList.innerHTML = "";
        const questions = data.interview_questions || [];
        if (data.mode && data.mode.includes("Gemini")) {
            questionsBadge.textContent = "AI Generated";
            questionsBadge.style.background = "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)";
        } else {
            questionsBadge.textContent = "Local Practice";
            questionsBadge.style.background = "rgba(255, 255, 255, 0.08)";
        }

        if (questions.length > 0) {
            questions.forEach((q, idx) => {
                const div = document.createElement("div");
                div.className = "question-item";
                div.innerHTML = `
                    <span class="q-num">${idx + 1}</span>
                    <span class="q-text">${q}</span>
                    <button class="copy-q-btn" title="Copy to clipboard">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                `;
                
                // Copy logic
                const copyBtn = div.querySelector(".copy-q-btn");
                copyBtn.addEventListener("click", () => {
                    navigator.clipboard.writeText(q).then(() => {
                        const icon = copyBtn.querySelector("i");
                        icon.className = "fa-solid fa-check";
                        icon.style.color = "var(--success)";
                        setTimeout(() => {
                            icon.className = "fa-regular fa-copy";
                            icon.style.color = "";
                        }, 2000);
                    });
                });

                questionsList.appendChild(div);
            });
        } else {
            questionsList.innerHTML = `<p style="font-size: 13px; color: var(--text-secondary);">No custom questions prepared.</p>`;
        }
    }

    function buildBulletList(listElement, bullets) {
        listElement.innerHTML = "";
        bullets.forEach(bullet => {
            const li = document.createElement("li");
            li.textContent = bullet;
            listElement.appendChild(li);
        });
    }

    // --- Circular Score progress animation helper ---
    function animateScore(score) {
        const circumference = 264; // 2 * PI * r = 2 * 3.14159 * 42 = 263.89
        scoreCircle.style.strokeDasharray = circumference;
        
        let currentScore = 0;
        const duration = 1200; // ms
        const steps = 60;
        const increment = score / steps;
        const stepTime = duration / steps;
        
        const counter = setInterval(() => {
            currentScore += increment;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(counter);
            }
            
            // Update counter number text
            scoreNumber.textContent = Math.round(currentScore);
            
            // Update circular fill
            const offset = circumference - (currentScore / 100) * circumference;
            scoreCircle.style.strokeDashoffset = offset;
        }, stepTime);
    }
});
