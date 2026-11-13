/* ==========================================
   STUDYCIRCLE PRO - JAVASCRIPT
   Group management, search and navigation
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. STORAGE SETTINGS
    // ======================================

    const GROUPS_STORAGE = "studyCircleProGroupsV1";
    const MEMBERSHIP_STORAGE = "studyCircleProMembershipsV1";

    const sampleGroups = [
        {
            id: "sample-1",
            name: "Database Design Study Group",
            module: "DATA6222",
            day: "Monday",
            time: "15:00",
            format: "Online",
            description: "Join us to practise SQL queries, database design and preparation for upcoming assessments.",
            createdByUser: false
        },
        {
            id: "sample-2",
            name: "Programming Practice Team",
            module: "PROG5121",
            day: "Tuesday",
            time: "14:00",
            format: "In-person",
            description: "A friendly group for practising programming concepts, solving problems and sharing knowledge.",
            createdByUser: false
        },
        {
            id: "sample-3",
            name: "Operating Systems Revision",
            module: "OPSY5121",
            day: "Wednesday",
            time: "16:00",
            format: "Hybrid",
            description: "Work together on operating systems topics, memory management and exam preparation.",
            createdByUser: false
        },
        {
            id: "sample-4",
            name: "Systems Analysis Discussion",
            module: "SAND6221",
            day: "Thursday",
            time: "13:00",
            format: "Online",
            description: "Discuss systems analysis concepts, assignment questions and important module topics.",
            createdByUser: false
        }
    ];

    function readStorage(key, fallback) {
        try {
            const saved = localStorage.getItem(key);

            if (saved === null) {
                return fallback;
            }

            return JSON.parse(saved);
        } catch (error) {
            console.error("Could not read saved data:", error);
            return fallback;
        }
    }

    function saveStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Could not save data:", error);
            showMessage("Your browser could not save this change.");
        }
    }

    let groups = readStorage(GROUPS_STORAGE, null);

    if (!Array.isArray(groups)) {
        groups = sampleGroups;
        saveStorage(GROUPS_STORAGE, groups);
    }

    let myGroupIds = readStorage(MEMBERSHIP_STORAGE, []);

    if (!Array.isArray(myGroupIds)) {
        myGroupIds = [];
    }

    // ======================================
    // 2. PAGE ELEMENTS
    // ======================================

    const pages = document.querySelectorAll(".page");
    const navLinks = document.querySelectorAll("[data-page]");
    const goButtons = document.querySelectorAll("[data-go]");

    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const navLinksContainer = document.getElementById("navLinks");

    // ======================================
    // 3. NAVIGATION
    // ======================================

    function showPage(pageName) {
        const targetPage = document.getElementById(pageName);

        if (!targetPage || !targetPage.classList.contains("page")) {
            return;
        }

        pages.forEach(page => {
            page.classList.remove("active");
        });

        targetPage.classList.add("active");

        navLinks.forEach(link => {
            const isActive = link.dataset.page === pageName;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        closeMobileMenu();

        if (pageName === "find") {
            displayGroups();
        }

        if (pageName === "my-groups") {
            displayMyGroups();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showPage(link.dataset.page);
        });
    });

    goButtons.forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.go);
        });
    });

    // ======================================
    // 4. MOBILE NAVIGATION
    // ======================================

    function closeMobileMenu() {
        if (!navLinksContainer || !mobileMenuToggle) {
            return;
        }

        navLinksContainer.classList.remove("open");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
    }

    if (mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener("click", () => {
            const isOpen = navLinksContainer.classList.toggle("open");

            mobileMenuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });
    }

    // ======================================
    // 5. MESSAGE NOTIFICATIONS
    // ======================================

    function showMessage(message) {
        let messageBox = document.getElementById("appMessage");

        if (!messageBox) {
            messageBox = document.createElement("div");
            messageBox.id = "appMessage";
            messageBox.className = "app-message";
            messageBox.setAttribute("role", "status");
            messageBox.setAttribute("aria-live", "polite");
            document.body.appendChild(messageBox);
        }

        messageBox.textContent = message;
        messageBox.hidden = false;

        if (messageBox._hideTimer) {
            clearTimeout(messageBox._hideTimer);
        }

        messageBox._hideTimer = setTimeout(() => {
            messageBox.hidden = true;
        }, 3500);
    }

    // ======================================
    // 6. SECURITY - HTML TEXT ESCAPING
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return characters[character];
        });
    }

    // ======================================
    // 7. GROUP MEMBERSHIP
    // ======================================

    function isMember(groupId) {
        return myGroupIds.includes(groupId);
    }

    function joinGroup(groupId) {
        const group = groups.find(item => item.id === groupId);

        if (!group) {
            return;
        }

        if (isMember(groupId)) {
            showMessage("You have already joined this group.");
            return;
        }

        myGroupIds.push(groupId);

        saveStorage(MEMBERSHIP_STORAGE, myGroupIds);

        displayGroups();
        displayMyGroups();

        showMessage("You successfully joined the study group!");
    }

    function leaveGroup(groupId) {
        const group = groups.find(item => item.id === groupId);

        if (!group) {
            return;
        }

        if (group.createdByUser) {
            showMessage("You cannot leave a group you created.");
            return;
        }

        myGroupIds = myGroupIds.filter(id => id !== groupId);

        saveStorage(MEMBERSHIP_STORAGE, myGroupIds);

        displayGroups();
        displayMyGroups();

        showMessage("You have left the study group.");
    }

    // ======================================
    // 8. DISPLAY STUDY GROUP CARDS
    // ======================================

    const groupsContainer = document.getElementById("groupsContainer");

    function createGroupCard(group, showMembershipButton = true) {
        const card = document.createElement("article");
        card.className = "group-card";

        const member = isMember(group.id);
        const createdByUser = Boolean(group.createdByUser);

        let buttonHTML = "";

        if (showMembershipButton) {
            if (createdByUser) {
                buttonHTML = `
                    <button class="btn btn-secondary" disabled>
                        Created by you
                    </button>
                `;
            } else if (member) {
                buttonHTML = `
                    <button
                        class="btn btn-outline"
                        data-action="leave"
                        data-group-id="${escapeHTML(group.id)}"
                    >
                        Leave Group
                    </button>
                `;
            } else {
                buttonHTML = `
                    <button
                        class="btn btn-primary"
                        data-action="join"
                        data-group-id="${escapeHTML(group.id)}"
                    >
                        Join Study Group
                    </button>
                `;
            }
        }

        card.innerHTML = `
            <span class="badge">
                ${escapeHTML(group.module)}
            </span>

            <h3>${escapeHTML(group.name)}</h3>

            <p class="group-description">
                ${escapeHTML(group.description)}
            </p>

            <div>
                <span class="tag">📅 ${escapeHTML(group.day)}</span>
                <span class="tag">🕒 ${escapeHTML(group.time)}</span>
                <span class="tag">📍 ${escapeHTML(group.format)}</span>
            </div>

            ${buttonHTML}
        `;

        return card;
    }

    // ======================================
    // 9. SEARCH AND FILTER STUDY GROUPS
    // ======================================

    const searchInput = document.getElementById("searchInput");
    const moduleFilter = document.getElementById("moduleFilter");
    const formatFilter = document.getElementById("formatFilter");
    const dayFilter = document.getElementById("dayFilter");
    const clearFilters = document.getElementById("clearFilters");
    const resultsCount = document.getElementById("resultsCount");

    function displayGroups() {
        if (!groupsContainer) {
            return;
        }

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedModule = moduleFilter
            ? moduleFilter.value
            : "";

        const selectedFormat = formatFilter
            ? formatFilter.value
            : "";

        const selectedDay = dayFilter
            ? dayFilter.value
            : "";

        const filteredGroups = groups.filter(group => {
            const searchableText = [
                group.name,
                group.module,
                group.description,
                group.day,
                group.format
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);
            const matchesModule = !selectedModule ||
                group.module === selectedModule;

            const matchesFormat = !selectedFormat ||
                group.format === selectedFormat;

            const matchesDay = !selectedDay ||
                group.day === selectedDay;

            return matchesSearch &&
                matchesModule &&
                matchesFormat &&
                matchesDay;
        });

        groupsContainer.innerHTML = "";

        if (resultsCount) {
            resultsCount.textContent =
                `${filteredGroups.length} study group${filteredGroups.length === 1 ? "" : "s"} found`;
        }

        if (filteredGroups.length === 0) {
            groupsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No study groups found</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            `;
            return;
        }

        filteredGroups.forEach(group => {
            groupsContainer.appendChild(createGroupCard(group));
        });
    }

    [searchInput, moduleFilter, formatFilter, dayFilter]
        .filter(Boolean)
        .forEach(element => {
            element.addEventListener("input", displayGroups);
            element.addEventListener("change", displayGroups);
        });

    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (moduleFilter) moduleFilter.value = "";
            if (formatFilter) formatFilter.value = "";
            if (dayFilter) dayFilter.value = "";

            displayGroups();

            showMessage("Search filters have been cleared.");
        });
    }

    // ======================================
    // 10. JOIN AND LEAVE BUTTONS
    // ======================================

    document.addEventListener("click", event => {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) {
            return;
        }

        const groupId = actionButton.dataset.groupId;
        const action = actionButton.dataset.action;

        if (action === "join") {
            joinGroup(groupId);
        }

        if (action === "leave") {
            leaveGroup(groupId);
        }
    });

    // ======================================
    // 11. CREATE A NEW STUDY GROUP
    // ======================================

    const createGroupForm = document.getElementById("createGroupForm");

    if (createGroupForm) {
        createGroupForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!createGroupForm.reportValidity()) {
                return;
            }

            const formData = new FormData(createGroupForm);

            const newGroup = {
                id: "group-" + Date.now() + "-" +
                    Math.random().toString(36).slice(2, 8),

                name: String(formData.get("groupName") || "").trim(),
                module: String(formData.get("groupModule") || ""),
                day: String(formData.get("groupDay") || ""),
                time: String(formData.get("groupTime") || ""),
                format: String(formData.get("groupFormat") || ""),
                description: String(
                    formData.get("groupDescription") || ""
                ).trim(),

                createdByUser: true
            };

            if (
                !newGroup.name ||
                !newGroup.module ||
                !newGroup.day ||
                !newGroup.time ||
                !newGroup.format ||
                !newGroup.description
            ) {
                showMessage("Please complete all the required fields.");
                return;
            }

            groups.unshift(newGroup);

            myGroupIds.push(newGroup.id);

            saveStorage(GROUPS_STORAGE, groups);
            saveStorage(MEMBERSHIP_STORAGE, myGroupIds);

            createGroupForm.reset();

            displayGroups();
            displayMyGroups();

            showPage("my-groups");

            showMessage("Your new study group has been created!");
        });
    }

    // ======================================
    // 12. MY GROUPS DASHBOARD
    // ======================================

    const myGroupsContainer =
        document.getElementById("myGroupsContainer");

    const totalGroups = document.getElementById("totalGroups");
    const createdGroups = document.getElementById("createdGroups");
    const joinedGroups = document.getElementById("joinedGroups");

    function displayMyGroups() {
        if (!myGroupsContainer) {
            return;
        }

        const myGroups = groups.filter(group => {
            return group.createdByUser || isMember(group.id);
        });

        const createdCount = groups.filter(group => {
            return group.createdByUser;
        }).length;

        const joinedCount = groups.filter(group => {
            return !group.createdByUser && isMember(group.id);
        }).length;

        if (totalGroups) {
            totalGroups.textContent = myGroups.length;
        }

        if (createdGroups) {
            createdGroups.textContent = createdCount;
        }

        if (joinedGroups) {
            joinedGroups.textContent = joinedCount;
        }

        myGroupsContainer.innerHTML = "";

        if (myGroups.length === 0) {
            myGroupsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>You haven't joined any study groups yet</h3>
                    <p>Explore available groups and find people to study with.</p>
                    <button class="btn btn-primary" data-go="find">
                        Explore Study Groups
                    </button>
                </div>
            `;
            return;
        }

        myGroups.forEach(group => {
            myGroupsContainer.appendChild(
                createGroupCard(group, true)
            );
        });
    }

    // ======================================
    // 13. FOOTER YEAR
    // ======================================

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // ======================================
    // 14. INITIAL WEBSITE DISPLAY
    // ======================================

    displayGroups();
    displayMyGroups();

    showPage("home");

    console.log("StudyCircle Pro loaded successfully.");
});