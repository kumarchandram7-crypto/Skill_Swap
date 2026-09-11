/**
 * SkillSwap Campus - Seed Data & Initial State
 */

const SEED_DATA = {
  currentUser: "student-1", // default logged-in user

  users: [
    {
      id: "student-1",
      name: "Rahul Sharma",
      email: "rahul.s@campus.edu",
      password: "password123",
      role: "student",
      department: "Computer Science & Eng.",
      year: "3rd Year",
      avatarBg: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      xp: 1450,
      campusRank: "Campus Pro #4",
      trustScore: 88,
      rating: 4.8,
      ratingsCount: 14,
      tasksCompleted: 14,
      skills: [
        { name: "Python", score: 85, rank: "Advanced", verified: true, testsTaken: 2 },
        { name: "Excel", score: 65, rank: "Intermediate", verified: true, testsTaken: 1 },
        { name: "HTML/CSS", score: 40, rank: "Novice", verified: false, testsTaken: 1 },
        { name: "Graphic Design", score: 20, rank: "Novice", verified: false, testsTaken: 0 }
      ],
      teaches: ["Python", "Algorithms", "Automation"],
      wantsToLearn: ["Figma UI Design", "Video Editing"],
      badges: ["Python Ace", "Speedy Delivery", "Club Contributor", "Top Rated 2026"]
    },
    {
      id: "student-2",
      name: "Ananya Patel",
      email: "ananya.p@campus.edu",
      password: "password123",
      role: "student",
      department: "Information Technology",
      year: "2nd Year",
      avatarBg: "linear-gradient(135deg, #ec4899, #f43f5e)",
      xp: 1950,
      campusRank: "Campus Legend #1",
      trustScore: 96,
      rating: 4.9,
      ratingsCount: 19,
      tasksCompleted: 18,
      skills: [
        { name: "Graphic Design", score: 95, rank: "Master", verified: true, testsTaken: 3 },
        { name: "HTML/CSS", score: 80, rank: "Advanced", verified: true, testsTaken: 2 },
        { name: "Video Editing", score: 75, rank: "Intermediate", verified: true, testsTaken: 1 }
      ],
      teaches: ["Figma", "Canva", "Poster Typography"],
      wantsToLearn: ["Python Data Science", "Excel Dashboards"],
      badges: ["Design Guru", "Campus Legend", "Pixel Perfect"]
    },
    {
      id: "student-3",
      name: "Dev Mehta",
      email: "dev.m@campus.edu",
      password: "password123",
      role: "student",
      department: "Mechanical Engineering",
      year: "3rd Year",
      avatarBg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      xp: 980,
      campusRank: "Senior Peer #12",
      trustScore: 84,
      rating: 4.7,
      ratingsCount: 9,
      tasksCompleted: 9,
      skills: [
        { name: "Excel", score: 92, rank: "Master", verified: true, testsTaken: 2 },
        { name: "Python", score: 55, rank: "Intermediate", verified: true, testsTaken: 1 }
      ],
      teaches: ["Excel Macros", "Data Analysis", "Formulas"],
      wantsToLearn: ["Fullstack Web Dev"],
      badges: ["Spreadsheet Wizard", "Quick Turnaround"]
    },
    {
      id: "provider-1",
      name: "Prof. S. Sen (Exam & Records Cell)",
      email: "examcell@campus.edu",
      password: "password123",
      role: "provider",
      department: "Academic Administration",
      organization: "Exam & Records Cell",
      orgType: "Faculty / Academic Dept",
      year: "Faculty / Staff",
      avatarBg: "linear-gradient(135deg, #1e293b, #475569)",
      tasksPosted: 8,
      tasksCompleted: 6
    },
    {
      id: "provider-2",
      name: "Arjun Nambiar (Robotics Club Lead)",
      email: "robotics@campus.edu",
      password: "password123",
      role: "provider",
      department: "Robotics & Innovation Society",
      organization: "Robotics & Innovation Society",
      orgType: "Student Club / Tech Society",
      year: "Club Council",
      avatarBg: "linear-gradient(135deg, #059669, #10b981)",
      tasksPosted: 5,
      tasksCompleted: 4
    }
  ],

  tasks: [
    {
      id: "task-1",
      title: "Clean & Format 1,200 Student Exam Attendance Records in Excel",
      description: "We have raw exported CSVs from the barcode scanner that contain duplicate rows and inconsistent date formats. Need someone proficient with Excel VLOOKUP/XLOOKUP and data cleaning to prepare the official Dean's report.",
      department: "Academic Exam Cell",
      requiredSkill: "Excel",
      minRank: "Intermediate",
      difficulty: "Intermediate",
      estTime: "2 hours",
      rewardAmount: 300,
      rewardType: "₹ Cash + Official Certificate",
      xpReward: 80,
      postedBy: "Prof. S. Sen (Exam & Records Cell)",
      postedById: "provider-1",
      postedAt: "2 hours ago",
      status: "open", // open, in_progress, completed
      assignedTo: null,
      applicants: [
        {
          studentId: "student-3",
          name: "Dev Mehta",
          skillScore: 92,
          skillRank: "Master",
          proposal: "I have automated similar exam reports last semester. Can deliver formatted sheets with pivot summaries in under 90 minutes.",
          appliedAt: "1 hour ago"
        }
      ]
    },
    {
      id: "task-2",
      title: "Build Python Automation Script for College Fest Registrations",
      description: "The fest portal generates CSV files every midnight. We need a clean Python script to parse participant names, validate college emails, sort them into events, and auto-generate QR tickets as PNGs using Pillow.",
      department: "Annual Tech Fest Committee",
      requiredSkill: "Python",
      minRank: "Intermediate",
      difficulty: "Intermediate",
      estTime: "3.5 hours",
      rewardAmount: 600,
      rewardType: "₹ Cash + Tech Fest VIP Pass",
      xpReward: 150,
      postedBy: "Annual Fest Council",
      postedById: "provider-1",
      postedAt: "4 hours ago",
      status: "open",
      assignedTo: null,
      applicants: []
    },
    {
      id: "task-3",
      title: "Design Official Posters & Social Graphics for HackCampus 2026",
      description: "Need 2 Instagram carousel posts and 1 main print poster for the upcoming inter-college hackathon. Assets, brand guidelines, and theme colors will be provided. Creative typography preferred.",
      department: "Developer Student Club (DSC)",
      requiredSkill: "Graphic Design",
      minRank: "Intermediate",
      difficulty: "Intermediate",
      estTime: "3 hours",
      rewardAmount: 500,
      rewardType: "₹ Cash + Portfolio Feature",
      xpReward: 110,
      postedBy: "DSC Design Lead",
      postedById: "provider-2",
      postedAt: "1 day ago",
      status: "open",
      assignedTo: null,
      applicants: [
        {
          studentId: "student-2",
          name: "Ananya Patel",
          skillScore: 95,
          skillRank: "Master",
          proposal: "I designed last year's TEDx campus posters. I can send 3 initial Figma concepts by tonight.",
          appliedAt: "18 hours ago"
        }
      ]
    },
    {
      id: "task-4",
      title: "Fix Mobile Responsive Menu & CSS Glitches on Robotics Club Site",
      description: "Our club website (HTML/CSS/Vanilla JS) has hamburger menu alignment issues on iOS devices and some overlapping cards on the projects gallery page. Looking for quick troubleshooting.",
      department: "Robotics & Innovation Society",
      requiredSkill: "HTML/CSS",
      minRank: "Intermediate",
      difficulty: "Beginner",
      estTime: "1.5 hours",
      rewardAmount: 350,
      rewardType: "₹ Cash + Club Merit Point",
      xpReward: 70,
      postedBy: "Arjun Nambiar (Robotics Club Lead)",
      postedById: "provider-2",
      postedAt: "2 days ago",
      status: "open",
      assignedTo: null,
      applicants: []
    },
    {
      id: "task-5",
      title: "Advanced Scraper & PDF Parser for Campus Faculty Research Papers",
      description: "Extract author metadata, publication dates, and citations from 80+ downloaded conference PDFs and compile into structured JSON. Requires Python with PyPDF2 or pdfplumber.",
      department: "CSE Research Wing",
      requiredSkill: "Python",
      minRank: "Advanced",
      difficulty: "Advanced",
      estTime: "5 hours",
      rewardAmount: 900,
      rewardType: "₹ Cash + Professor Recommendation (LoR)",
      xpReward: 220,
      postedBy: "Prof. S. Sen (Exam & Records Cell)",
      postedById: "provider-1",
      postedAt: "3 days ago",
      status: "open",
      assignedTo: null,
      applicants: []
    },
    {
      id: "task-6",
      title: "Edit 90-Second Promotional Highlight Video for Sports Meet",
      description: "Footage from yesterday's football and basketball finals needs dynamic cuts, background music (royalty-free), and title slides for the campus sports council Instagram page.",
      department: "Campus Sports Council",
      requiredSkill: "Video Editing",
      minRank: "Intermediate",
      difficulty: "Intermediate",
      estTime: "2.5 hours",
      rewardAmount: 450,
      rewardType: "₹ Cash + Sports Fest Entry",
      xpReward: 95,
      postedBy: "Sports Secretary",
      postedById: "provider-1",
      postedAt: "5 hours ago",
      status: "open",
      assignedTo: null,
      applicants: []
    },
    {
      id: "task-7",
      title: "Mess Committee Inventory Tracking Sheet Setup",
      description: "Create an auto-calculating Excel sheet with low-stock alerts and weekly expense charts for the Boys Hostel Mess supervisor.",
      department: "Hostel Affairs Board",
      requiredSkill: "Excel",
      minRank: "Beginner",
      difficulty: "Beginner",
      estTime: "2 hours",
      rewardAmount: 250,
      rewardType: "₹ Cash + Meal Coupon",
      xpReward: 50,
      postedBy: "Prof. S. Sen (Exam & Records Cell)",
      postedById: "provider-1",
      postedAt: "3 days ago",
      status: "completed",
      assignedTo: "student-1",
      review: {
        rating: 5,
        comment: "Rahul automated our entire weekly grocery tally in under two hours. Clean, color-coded, and very easy for the staff to use!",
        by: "Hostel Affairs Board",
        givenAt: "Yesterday"
      },
      applicants: []
    }
  ],

  // Skill Verification Assessments
  quizzes: {
    Python: {
      skill: "Python",
      description: "Test Python scripting, data structures, list comprehensions, and practical problem solving.",
      duration: "5 min",
      questionsCount: 4,
      questions: [
        {
          id: "py-1",
          question: "What is the output of the following Python list comprehension?",
          code: "nums = [1, 2, 3, 4, 5]\nres = [x * 2 for x in nums if x % 2 == 0]\nprint(res)",
          options: [
            "[2, 4, 6, 8, 10]",
            "[4, 8]",
            "[2, 6, 10]",
            "[4, 16]"
          ],
          correct: 1,
          explanation: "Only even numbers (2 and 4) pass the `if x % 2 == 0` filter, and each is multiplied by 2 -> [4, 8]."
        },
        {
          id: "py-2",
          question: "Which Python standard library is best suited for working with CSV tabular datasets and file I/O?",
          code: null,
          options: [
            "csv / pandas",
            "regex",
            "socket",
            "threading"
          ],
          correct: 0,
          explanation: "The built-in `csv` module and third-party `pandas` library are standard for reading, transforming, and writing CSV data."
        },
        {
          id: "py-3",
          question: "What does the dictionary `.get(key, default)` method do when the key does not exist?",
          code: "data = {'apple': 5}\nval = data.get('banana', 0)",
          options: [
            "Throws a KeyError exception",
            "Returns None without creating the key",
            "Returns the default value (0) without raising a KeyError",
            "Inserts 'banana': 0 into the dictionary"
          ],
          correct: 2,
          explanation: "`.get()` safely retrieves values and returns the specified fallback (0 in this case) if the key is missing."
        },
        {
          id: "py-4",
          question: "In Python error handling, when does the `finally` block execute?",
          code: "try:\n    perform_task()\nexcept Exception:\n    handle_err()\nfinally:\n    cleanup()",
          options: [
            "Only if an exception occurred",
            "Only if no exception occurred",
            "Always, whether an exception occurred or not",
            "Only if the exception was caught by `handle_err`"
          ],
          correct: 2,
          explanation: "The `finally` clause always executes upon leaving the try statement, making it ideal for resource cleanup."
        }
      ]
    },

    Excel: {
      skill: "Excel",
      description: "Test formulas, VLOOKUP/XLOOKUP, conditional formatting, and data cleaning proficiency.",
      duration: "5 min",
      questionsCount: 4,
      questions: [
        {
          id: "ex-1",
          question: "Which modern Excel formula replaces VLOOKUP with safer default matching and two-way lookups?",
          code: "=______(lookup_value, lookup_array, return_array)",
          options: [
            "XLOOKUP",
            "INDEX_MATCH_AUTO",
            "LOOKUP_EXACT",
            "TABLELOOKUP"
          ],
          correct: 0,
          explanation: "XLOOKUP replaces VLOOKUP and HLOOKUP, doesn't require hardcoded column indices, and defaults to exact matches."
        },
        {
          id: "ex-2",
          question: "Which formula counts the number of cells in range A1:A50 that equal 'Completed'?",
          code: null,
          options: [
            "=COUNT(A1:A50, 'Completed')",
            "=COUNTIF(A1:A50, \"Completed\")",
            "=SUMIF(A1:A50, \"Completed\")",
            "=FILTERCOUNT(A1:A50 = \"Completed\")"
          ],
          correct: 1,
          explanation: "`COUNTIF(range, criteria)` calculates the number of cells matching a specific condition."
        },
        {
          id: "ex-3",
          question: "How do you lock cell references (make them absolute) so they don't shift when dragged down?",
          code: null,
          options: [
            "Surround formula in quotes like \"A1\"",
            "Add dollar signs, e.g., $A$1",
            "Prefix with hashtag, e.g., #A1",
            "Press Ctrl + Shift + L"
          ],
          correct: 1,
          explanation: "The `$` sign locks the column ($A) and/or row ($1) for absolute reference."
        },
        {
          id: "ex-4",
          question: "What Excel feature quickly splits a full name column ('Rahul Sharma') into First and Last names without formulas?",
          code: null,
          options: [
            "Flash Fill (Ctrl + E) or Text to Columns",
            "Data Validation",
            "Goal Seek",
            "Scenario Manager"
          ],
          correct: 0,
          explanation: "Flash Fill (Ctrl+E) recognizes data patterns and splits text automatically; 'Text to Columns' is the delimiter-based tool."
        }
      ]
    },

    "HTML/CSS": {
      skill: "HTML/CSS",
      description: "Test Flexbox, Grid, semantic HTML5, responsive media queries, and layout debugging.",
      duration: "5 min",
      questionsCount: 4,
      questions: [
        {
          id: "web-1",
          question: "How do you center an item horizontally and vertically inside a CSS Flex container?",
          code: ".container {\n  display: flex;\n  /* ? */\n}",
          options: [
            "align-items: center; justify-content: center;",
            "text-align: center; vertical-align: middle;",
            "float: center; margin: auto;",
            "place-self: middle;"
          ],
          correct: 0,
          explanation: "`justify-content: center` aligns on the main axis and `align-items: center` aligns on the cross axis."
        },
        {
          id: "web-2",
          question: "What CSS property prevents an element's padding and border from expanding its total defined width?",
          code: null,
          options: [
            "box-sizing: border-box;",
            "overflow: hidden;",
            "width-clamp: true;",
            "display: inline-block;"
          ],
          correct: 0,
          explanation: "`box-sizing: border-box` includes padding and border within the specified element width and height."
        },
        {
          id: "web-3",
          question: "Which HTML5 tag represents independent, self-contained content such as a blog post or campus task card?",
          code: null,
          options: [
            "<section>",
            "<article>",
            "<aside>",
            "<div>"
          ],
          correct: 1,
          explanation: "`<article>` is the semantic HTML element for self-contained, distributable composition."
        },
        {
          id: "web-4",
          question: "In responsive web design, which media query applies styles only on screens 768px wide or smaller?",
          code: null,
          options: [
            "@media (max-width: 768px) { ... }",
            "@media (min-width: 768px) { ... }",
            "@media screen and (mobile: true) { ... }",
            "@media device-width <= 768px { ... }"
          ],
          correct: 0,
          explanation: "`@media (max-width: 768px)` targets viewports from 0px up to 768px."
        }
      ]
    },

    "Graphic Design": {
      skill: "Graphic Design",
      description: "Test visual hierarchy, color theory, typography, resolution, and asset export standards.",
      duration: "5 min",
      questionsCount: 4,
      questions: [
        {
          id: "gd-1",
          question: "What is the standard resolution (DPI) required for high-quality campus print posters versus digital screens?",
          code: null,
          options: [
            "300 DPI for Print / 72 DPI for Screen",
            "72 DPI for Print / 300 DPI for Screen",
            "150 DPI for both",
            "1080 DPI for Print"
          ],
          correct: 0,
          explanation: "300 DPI is the universal printing standard for sharp reproduction, while 72-96 PPI is standard for web/screens."
        },
        {
          id: "gd-2",
          question: "What color mode should be selected when designing a poster intended to be printed by the college printing press?",
          code: null,
          options: [
            "RGB",
            "CMYK",
            "HEX",
            "Grayscale"
          ],
          correct: 1,
          explanation: "CMYK (Cyan, Magenta, Yellow, Key/Black) is the 4-color ink model used for physical commercial printing."
        },
        {
          id: "gd-3",
          question: "In typography and poster design, what does 'Kerning' refer to?",
          code: null,
          options: [
            "The vertical space between lines of text",
            "The horizontal space between specific individual letter pairs",
            "The boldness or stroke weight of a font",
            "The indent size of a paragraph"
          ],
          correct: 1,
          explanation: "Kerning adjusts the spacing between two individual characters to achieve balanced visual harmony."
        },
        {
          id: "gd-4",
          question: "Which file format supports lossless compression and transparent backgrounds for logos and stickers?",
          code: null,
          options: [
            "JPEG",
            "PNG / SVG",
            "GIF (lossy only)",
            "BMP"
          ],
          correct: 1,
          explanation: "PNG supports an alpha channel for transparency with lossless compression, and SVG is vector-scalable."
        }
      ]
    }
  },

  // Peer Skill Exchange Directory
  peerSwaps: [
    {
      id: "swap-1",
      studentId: "student-1",
      name: "Rahul Sharma",
      department: "CSE, 3rd Year",
      avatarBg: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      rating: 4.8,
      reviewsCount: 14,
      teaches: ["Python", "Task Automation", "Git & GitHub"],
      wantsToLearn: ["Figma UI Design", "Video Editing"],
      bio: "Proficient in Python scripting and backend. Looking for someone to guide me on modern Figma UI design for my web projects in exchange for Python tutoring.",
      availability: "Weekends & Evenings"
    },
    {
      id: "swap-2",
      studentId: "student-2",
      name: "Ananya Patel",
      department: "IT, 2nd Year",
      avatarBg: "linear-gradient(135deg, #ec4899, #f43f5e)",
      rating: 4.9,
      reviewsCount: 19,
      teaches: ["Figma & UI Kits", "Canva Pro", "Poster Layouts"],
      wantsToLearn: ["Python Data Science", "Excel Automation"],
      bio: "Design lead for 3 campus fests! I can teach you typography, component libraries, and portfolio layouts. Want to learn Python for data analysis.",
      availability: "Mon / Wed / Fri 5-7 PM"
    },
    {
      id: "swap-3",
      studentId: "student-3",
      name: "Dev Mehta",
      department: "Mech Eng, 3rd Year",
      avatarBg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      rating: 4.7,
      reviewsCount: 9,
      teaches: ["Advanced Excel", "Financial Modeling", "Pivot Charts"],
      wantsToLearn: ["Web Development (HTML/CSS)"],
      bio: "Master of Excel shortcuts, formulas, and dashboards. Want to swap 1-on-1 sessions to build my own personal portfolio website.",
      availability: "Saturday Afternoons"
    },
    {
      id: "swap-4",
      studentId: "student-4",
      name: "Tanvi Saxena",
      department: "Electronics & Comm, 4th Year",
      avatarBg: "linear-gradient(135deg, #10b981, #059669)",
      rating: 4.95,
      reviewsCount: 22,
      teaches: ["Resume Reviews", "Technical Pitching", "Content Writing"],
      wantsToLearn: ["Python Automation", "Canva Graphics"],
      bio: "Placed at top tech firm! Happy to help juniors polish their tech resumes and interview answers in exchange for help automating club spreadsheets.",
      availability: "Flexible via Google Meet / Campus Library"
    }
  ]
};

// Expose globally
window.SEED_DATA = SEED_DATA;
