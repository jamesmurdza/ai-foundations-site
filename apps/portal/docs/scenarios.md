# 100 Usage Scenarios — AI Foundations Summer School Portal

Real student + admin journeys used to drive and validate the build. Each line is
**Actor · action → expected outcome**. Coverage tags: **[E2E]** Playwright,
**[unit]** Vitest, **[manual]** verified by hand / inspection.

A focus of this pass: **every admin "write" surface lets you attach documents
that students download**, and the shared UI matches the public `ai-foundations-site`
(Schibsted Grotesk wordmark, bordered-frame layout, purple accent, Inter body).

---

## A. Public / visitor (1–10)

1. Visitor opens `/` → bordered-frame hero "Build in public. Graduate with traction." renders. [E2E]
2. Visitor sees the nav wordmark "AI Foundations" in heading font, matching the site. [manual]
3. Visitor sees live cohort stats (participants, applications, projects, stars). [manual]
4. Visitor sees the world map of where the cohort builds from. [E2E]
5. Visitor opens `/showcase` and browses shipped projects. [E2E]
6. Visitor opens `/stars` and sees the star leaderboard. [E2E]
7. Visitor opens `/pulse` and sees the live activity feed. [E2E]
8. Visitor opens `/map` → "Look how far this reaches" renders. [E2E]
9. Visitor opens `/profiles` (People) directory. [E2E]
10. Visitor hits a protected route (`/dashboard`) → redirected to `/login`. [E2E]

## B. Auth & onboarding (11–22)

11. New user requests an email sign-in code from the homepage form. [manual]
12. Login page advances to the "Check your email" code step. [E2E]
13. Login page offers the dev-login shortcut (when enabled). [E2E]
14. User enters a wrong/expired code → friendly error shown. [manual]
15. Accepted applicant signs in with their application email → profile pre-filled from `hh_applications`. [manual]
16. Dev login signs a new user straight into onboarding. [E2E]
17. Onboarding step 1: user sets display name + country. [E2E]
18. Onboarding step 2: user sets a goal ("Reach 50 GitHub stars"). [E2E]
19. Onboarding step 3: user finishes (GitHub connect optional) → lands on dashboard. [E2E]
20. Returning user signing in skips onboarding → dashboard. [manual]
21. Signed-in user signs out from the dashboard. [manual]
22. Founder email (in `ADMIN_EMAILS`) is flagged admin on login. [E2E]

## C. Dashboard & weeks (23–38)

23. Student lands on dashboard → "Hey {name} 👋" greeting. [E2E]
24. Dashboard shows streak, stars, reviews-to-give, submissions counters. [manual]
25. Student checks in → streak increments and persists across reload. [E2E]
26. Dashboard shows the current week and its assignments. [manual]
27. Dashboard "Announcements" lists the latest organizer posts. [E2E]
28. **Announcement docs appear as download chips on the dashboard.** [E2E]
29. **This-week assignment docs appear as download chips on the dashboard.** [manual]
30. Dashboard links into the current week page. [manual]
31. Student opens `/weeks` and sees all published weeks. [manual]
32. Student opens a week page → stream embed (or placeholder) renders. [manual]
33. Week page shows live viewers + emoji reactions when live. [manual]
34. Week page Q&A: student asks a question. [manual]
35. Week page Q&A: student upvotes a question. [manual]
36. Admin marks a week question answered. [manual]
37. **Week page "Materials" lists admin-uploaded files to download.** [E2E]
38. **Week "Resources" list renders link- and file-type resources (files download).** [manual]

## D. Assignments & submissions (39–56)

39. Student opens an assignment → prompt + deadline countdown render. [manual]
40. **Assignment page shows "Assignment files" the admin attached, downloadable.** [E2E]
41. Student submits a link-type assignment → confirmation page. [E2E]
42. Student submits a repo-type assignment → repo owner/name parsed. [manual]
43. Student writes a text-type submission. [manual]
44. **Student uploads a file with their submission → it's downloadable on the submission page.** [E2E]
45. **File-type assignment is satisfied by an upload with no link pasted.** [manual]
46. Submitting nothing (no link, no file) → "Add a link or upload a file" error. [manual]
47. Student updates/resubmits an existing submission. [manual]
48. Submission appears on the showcase. [E2E]
49. Submission appears on the week's showcase. [manual]
50. Trade-stars consent checkbox is shown for link/repo submissions. [E2E]
51. Opting into trade-stars records the consent. [E2E]
52. Student opts out of star trading from the submission page. [manual]
53. Submission triggers a "submission received" email (logged when SMTP off). [manual]
54. Assignment with deadline shows a countdown; reminders can be sent. [manual]
55. Admin sends deadline reminders only to non-submitters. [manual]
56. Submitting tops up random peer-review assignments. [manual]

## E. Peer review & feedback (57–66)

57. Admin runs matching for an assignment → reviewers assigned randomly. [manual]
58. Student sees "reviews to give" count on the dashboard. [manual]
59. Student opens `/feedback` and sees pending reviews. [manual]
60. Reviewer leaves feedback + rating on a matched submission. [E2E]
61. Feedback shows on the submission with a "matched" badge. [manual]
62. Author sees peer feedback on their own submission. [manual]
63. A peer leaves a comment on a submission. [E2E]
64. Owner cannot review their own submission. [manual]
65. A reviewer can't double-submit feedback on the same submission. [manual]
66. Random matching survives heavy week-to-week dropout (no reputation needed). [manual]

## F. Stars, glow-up, profiles, map (67–80)

67. Admin runs the star-trade batch for a week. [manual]
68. Mutual opt-in participants auto-star + follow each other on GitHub. [manual]
69. Star board totals + per-person counts update. [manual]
70. Dashboard "GitHub glow-up" shows stars/followers/repos vs intake. [manual]
71. Student opens another participant's profile. [manual]
72. Profile shows goal, socials, country, submissions. [manual]
73. Visitor comments on a profile (when allowed). [manual]
74. Directory lists all participants with stars received. [E2E]
75. Map aggregates participant/applicant countries (`hh_applications.q1`). [manual]
76. Showcase grid renders submission cards with feedback/comment counts. [manual]
77. Demo Day page renders. [manual]
78. Star leaderboard ranks by stars received desc. [manual]
79. Graduates are flagged on their profile. [manual]
80. Pulse feed records joins, submissions, announcements, go-lives. [manual]

## G. Admin console — every write surface can attach docs (81–95)

81. Non-admin visiting `/admin` is redirected to `/dashboard`. [manual]
82. Founder opens `/admin` (Stream) → quick actions + compose box. [manual]
83. **Admin posts an announcement with attached docs → chips show in the stream.** [E2E]
84. Admin pins an announcement to the top. [manual]
85. Admin emails an announcement to the whole cohort (logged when SMTP off). [manual]
86. Admin deletes an announcement. [manual]
87. **Admin removes a single attachment from a post (× control).** [manual]
88. **Admin creates an assignment with attached starter docs.** [E2E]
89. Admin sets submission type, deadline, peer-review count. [manual]
90. **Admin adds a week + uploads "Materials" students can download.** [E2E]
91. **Admin adds a downloadable file resource to a week (upload, not just a link).** [manual]
92. Admin sets a week live → cohort emailed, pulse updated. [manual]
93. Admin sends a weekly-update email. [manual]
94. Admin manages the founder allowlist on `/admin/team`. [manual]
95. Admin views the people roster + email deliverability log. [manual]

## H. Attachments, downloads & edge cases (96–100)

96. **Download route serves files with `Content-Disposition: attachment` + `nosniff`.** [E2E]
97. **Unknown file id → 404.** [E2E]
98. **Oversized (>15 MB) or empty files are rejected/skipped on upload.** [unit]
99. **Filenames are sanitized (path + control chars stripped) before storage/headers.** [unit]
100. **Byte size, icon, and inline-vs-download decisions render correctly per type.** [unit]

---

### Automated coverage map

| Area | Spec |
|------|------|
| Public pages, login, protected redirect | `tests/e2e/smoke.spec.ts` |
| Sign-up → onboarding → dashboard → directory, submit, check-in | `tests/e2e/journey.spec.ts` |
| Peer feedback + comments | `tests/e2e/feedback.spec.ts` |
| Admin upload → student download (assignment / announcement / week / submission), 404 | `tests/e2e/attachments.spec.ts` |
| Upload validation, byte formatting, filename sanitation, icons, inline rules | `tests/unit/attachments.test.ts` |
| URL/login parsing, date formatting, geo projection | `tests/unit/*.test.ts` |
