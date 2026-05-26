const glassPanel =
  "border border-white/10 bg-white/[0.075] shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl";
const softPanel =
  "border border-white/10 bg-slate-950/45 shadow-xl shadow-black/20 backdrop-blur-xl";
const inputBase =
  "w-full rounded-lg border bg-slate-950/70 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-70";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-slate-100 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/60";

export const navbarStyles = {
  nav: "sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 px-4 py-3 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-6 lg:px-10",
  decorativePattern: "absolute inset-0 opacity-[0.08] pointer-events-none hidden sm:block",
  decorativePatternBackground:
    "linear-gradient(115deg, rgba(56,189,248,.35), transparent 30%, rgba(16,185,129,.25) 68%, transparent)",
  bubble1: "pointer-events-none absolute left-[12%] top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl md:block animate-float-slow",
  bubble2: "pointer-events-none absolute right-[18%] top-0 hidden h-20 w-20 rounded-full bg-emerald-300/15 blur-3xl lg:block animate-float-slower",
  bubble3: "pointer-events-none absolute right-[34%] bottom-0 hidden h-16 w-16 rounded-full bg-amber-300/15 blur-2xl md:block animate-float-slowest",
  container: "relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4",
  logoContainer: "flex shrink-0 items-center",
  logoButton: "group inline-flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950",
  logoInner: "grid h-11 w-11 place-items-center overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-lg shadow-black/20 transition duration-300 group-hover:-translate-y-0.5",
  logoImage: "h-full w-full object-cover",
  titleContainer: "flex flex-1 justify-center px-2",
  titleBackground: "rounded-lg border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl",
  titleText: "truncate text-center text-sm font-black tracking-normal text-white sm:text-base md:text-xl",
  desktopButtonsContainer: "hidden shrink-0 items-center gap-2 md:flex",
  spacer: "hidden",
  resultsButton: secondaryButton,
  logoutButton:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-2.5 text-sm font-bold text-rose-100 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-rose-400/15",
  loginButton: primaryButton.replace("py-3", "py-2.5"),
  buttonIcon: "h-4 w-4 shrink-0",
  mobileMenuContainer: "relative flex items-center md:hidden",
  menuToggleButton: "grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/15",
  menuIcon: "h-5 w-5",
  mobileMenuPanel: "absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-lg border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-2xl",
  mobileMenuList: "divide-y divide-white/10",
  mobileMenuItem: "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/10",
  mobileMenuIcon: "h-4 w-4 text-cyan-200",
  animations: `
    @keyframes float-slow { 0%,100% { transform: translateY(-50%) translateX(0); } 50% { transform: translateY(calc(-50% - 10px)) translateX(8px); } }
    @keyframes float-slower { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
    @keyframes float-slowest { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    .animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
    .animate-float-slower { animation: float-slower 11s ease-in-out infinite; }
    .animate-float-slowest { animation: float-slowest 13s ease-in-out infinite; }
  `,
};

export const loginStyles = {};

export const signupStyles = {
  pageContainer:
    "relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.20),transparent_28%)]",
  backButton:
    "absolute left-4 top-5 z-10 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 shadow-lg backdrop-blur transition hover:bg-white/15 sm:left-6 sm:top-6",
  backButtonIcon: "h-4 w-4",
  backButtonText: "text-sm",
  formContainer: "relative z-10 w-full max-w-md pt-12",
  animatedBorder:
    "rounded-lg bg-gradient-to-r from-sky-300/70 via-cyan-300/70 to-emerald-300/70 p-px shadow-2xl shadow-cyan-950/30",
  formContent: `${glassPanel} rounded-lg p-5 sm:p-6 md:p-8`,
  heading: "mb-4 flex items-center gap-3 text-2xl font-black text-white",
  headingIcon:
    "grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-sky-300 to-emerald-300 text-slate-950 shadow-lg",
  headingIconInner: "h-5 w-5",
  headingText: "text-white",
  subtitle: "mb-6 text-sm leading-6 text-slate-300",
  label: "mb-4 block",
  labelText: "text-sm font-bold text-slate-200",
  inputContainer: "relative mt-2",
  inputIcon: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
  inputIconInner: "h-5 w-5 text-slate-400",
  input: `${inputBase} px-10 py-3`,
  inputNormal: "border-white/10",
  inputError: "border-rose-400 focus:border-rose-300 focus:ring-rose-300/10",
  passwordInput: "pr-12",
  passwordToggle:
    "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-white",
  passwordToggleIcon: "h-5 w-5",
  errorText: "mt-2 text-xs font-semibold text-rose-300",
  submitError: "mb-3 rounded-lg border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100",
  buttonsContainer: "mt-5 grid gap-3",
  submitButton: primaryButton,
  loginPromptContainer: "mt-5",
  loginPromptContent:
    "flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur sm:flex-row",
  loginPromptText: "text-sm text-slate-300",
  loginPromptLink: "text-sm font-black text-cyan-200 transition hover:text-cyan-100",
  animations: "",
};

export const sidebarStyles = {
  pageContainer:
    "min-h-screen bg-slate-950 text-white [color-scheme:dark] bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,.14),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(16,185,129,.12),transparent_26%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] md:pl-24",
  mobileOverlay: "fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden",
  mainContainer: "flex min-h-screen",
  sidebar:
    "fixed left-0 top-0 z-40 flex h-screen w-[min(20rem,calc(100vw-1.5rem))] transform flex-col overflow-hidden border-r border-white/10 bg-slate-950/88 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-transform duration-300 ease-out md:relative md:w-80 md:translate-x-0",
  sidebarHeader: "relative overflow-hidden border-b border-white/10 p-5",
  headerDecoration1:
    "absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/15 blur-2xl",
  headerDecoration2:
    "absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl",
  headerContent: "relative z-10 flex items-center justify-between",
  logoContainer: "flex items-center gap-3",
  logoIcon:
    "grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/10 text-cyan-200 shadow-lg backdrop-blur",
  logoTitle: "text-lg font-black text-white",
  logoSubtitle: "mt-0.5 text-xs font-medium text-slate-400",
  closeButton:
    "grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/15 md:hidden",
  sidebarContent: "sidebar-content premium-scroll flex-1 overflow-y-auto p-4",
  technologiesHeader: "mb-4 flex items-center justify-between",
  technologiesTitle: "text-sm font-black uppercase tracking-[0.18em] text-slate-400",
  technologiesCount:
    "rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100",
  techItem: "mb-3",
  techButton:
    "w-full rounded-lg border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60",
  techButtonSelected:
    "border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-lg shadow-cyan-950/20",
  techButtonNormal:
    "border-white/10 bg-white/[0.055] text-slate-200 hover:border-cyan-300/25 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-950/10",
  techButtonContent: "flex items-center gap-3",
  techIcon:
    "grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-cyan-200",
  techName: "font-bold",
  levelsContainer:
    "mt-3 rounded-lg border border-white/10 bg-black/20 p-3 shadow-inner shadow-black/20",
  levelsTitle:
    "mb-3 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400",
  techBadge:
    "rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[11px] tracking-normal text-cyan-100",
  levelButton:
    "my-2 flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60",
  levelButtonSelected:
    "border-emerald-300/35 bg-emerald-300/10 text-emerald-50 shadow-lg shadow-emerald-950/20",
  levelButtonNormal:
    "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/20 hover:bg-white/10",
  levelButtonContent: "flex items-center gap-2",
  levelIcon: "grid h-8 w-8 place-items-center rounded-md bg-white/10 text-cyan-200",
  levelQuestions:
    "rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold text-slate-300",
  sidebarFooter: "border-t border-white/10 bg-slate-950/80 p-4",
  footerContent: "rounded-lg border border-white/10 bg-white/[0.05] p-3 text-center",
  footerContentCenter: "text-xs font-medium text-slate-400",
  footerHighlight: "mt-1 font-black text-cyan-200",
  mainContent: "min-w-0 flex-1 p-4 sm:p-5 md:p-6 lg:p-8",
  mobileHeader:
    "mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-3 shadow-xl backdrop-blur-xl md:hidden",
  menuButton:
    "grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white",
  mobileTitle: "mx-3 flex-1",
  mobileTechInfo: "flex items-center justify-center gap-3",
  mobileTechIcon: "grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10",
  mobileTechText: "min-w-0",
  mobileTechName: "truncate text-sm font-black text-white",
  mobileTechLevel: "text-xs text-slate-400",
  mobilePlaceholder: "text-center text-sm font-semibold text-slate-300",
  mobileLevels: "mb-4 md:hidden",
  mobileLevelsContainer: "flex gap-2 overflow-x-auto pb-2",
  mobileLevelButton:
    "flex-none rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/60",
  welcomeContainer: "flex min-h-[calc(100vh-7rem)] items-center justify-center",
  welcomeContent: `${glassPanel} mx-auto max-w-4xl rounded-lg p-5 text-center sm:p-8 lg:p-10`,
  welcomeIcon:
    "mx-auto mb-6 grid h-20 w-20 place-items-center rounded-lg bg-gradient-to-br from-sky-300 to-emerald-300 text-slate-950 shadow-xl shadow-cyan-950/30",
  welcomeTitle: "mb-4 text-3xl font-black tracking-normal text-white md:text-5xl",
  welcomeDescription:
    "mx-auto mb-7 max-w-2xl text-sm leading-7 text-slate-300 md:text-base",
  featuresGrid: "mb-7 grid grid-cols-1 gap-4 md:grid-cols-3",
  featureCard:
    "rounded-lg border border-white/10 bg-white/[0.07] p-5 text-left shadow-lg shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/10 hover:shadow-cyan-950/10",
  featureIcon:
    "mb-4 grid h-11 w-11 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200",
  featureTitle: "mb-2 text-sm font-black text-white",
  featureDescription: "text-sm leading-6 text-slate-400",
  welcomePrompt:
    "rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100",
  welcomePromptText: "flex items-center justify-center text-sm font-bold",
  levelSelectionContainer: "flex min-h-[calc(100vh-7rem)] items-center justify-center",
  levelSelectionContent: `${glassPanel} max-w-md rounded-lg p-8 text-center`,
  techSelectionIcon:
    "mx-auto mb-6 grid h-16 w-16 place-items-center rounded-lg border border-white/10 bg-white/10",
  techSelectionTitle: "mb-2 text-3xl font-black text-white",
  techSelectionDescription: "mb-6 text-sm text-slate-300",
  techSelectionPrompt:
    "rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100",
  techSelectionPromptText: "text-sm font-bold",
  resultsContainer: "flex min-h-[calc(100vh-7rem)] items-center justify-center",
  resultsContent: `${glassPanel} w-full max-w-2xl rounded-lg p-5 sm:p-8`,
  resultsHeader: "text-center",
  performanceIcon:
    "mx-auto mb-5 grid h-16 w-16 place-items-center rounded-lg shadow-lg",
  resultsTitle: "mb-2 text-3xl font-black text-white md:text-4xl",
  resultsSubtitle: "mb-3 text-sm text-slate-300",
  performanceBadge:
    "mb-6 inline-flex rounded-lg px-4 py-2 text-sm font-black text-slate-950",
  scoreGrid: "mb-6 grid grid-cols-2 gap-3 sm:gap-4",
  scoreCard:
    "rounded-lg border border-white/10 bg-white/[0.07] p-5 text-center backdrop-blur",
  scoreIcon:
    "mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200",
  scoreNumber: "text-3xl font-black text-white",
  scoreLabel: "text-xs font-bold uppercase tracking-[0.12em] text-slate-400",
  scoreProgress:
    "rounded-lg border border-white/10 bg-black/20 p-4 shadow-inner shadow-black/20",
  scoreProgressHeader: "mb-3 flex items-center justify-between",
  scoreProgressTitle: "text-sm font-bold text-slate-300",
  scoreProgressPercentage: "text-sm font-black text-cyan-200",
  scoreProgressBar: "h-3 w-full overflow-hidden rounded-full bg-white/10",
  scoreProgressFill: "h-3 rounded-full transition-all duration-700",
  quizContainer: "mx-auto max-w-4xl",
  quizHeader: `${softPanel} mb-5 rounded-lg p-5`,
  quizTitleContainer:
    "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  quizTitle: "text-xl font-black text-white md:text-2xl",
  quizCounter:
    "w-fit rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold text-cyan-100",
  progressBar: "h-3 w-full overflow-hidden rounded-full bg-white/10",
  progressFill:
    "h-3 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 transition-all duration-700",
  questionContainer: `${glassPanel} rounded-lg p-5 sm:p-7 lg:p-8`,
  questionHeader: "mb-6 flex items-start gap-3",
  questionIcon:
    "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200",
  questionText: "text-lg font-black leading-7 text-white md:text-xl",
  optionsContainer: "mt-6 space-y-3",
  optionButton:
    "w-full cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:cursor-default md:p-5",
  optionNormal:
    "border-white/10 bg-white/[0.06] text-slate-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10",
  optionCorrect:
    "border-emerald-300/40 bg-emerald-300/15 text-emerald-50 shadow-lg shadow-emerald-950/20",
  optionIncorrect:
    "border-rose-300/40 bg-rose-400/15 text-rose-50 shadow-lg shadow-rose-950/20",
  optionContent: "flex items-center gap-3",
  optionIconCorrect: "shrink-0 text-emerald-300",
  optionIconIncorrect: "shrink-0 text-rose-300",
  optionIconEmpty: "h-5 w-5 shrink-0 rounded-full border-2 border-white/20",
  optionText: "text-sm font-semibold leading-6 md:text-base",
  loadingContainer: "flex min-h-[calc(100vh-7rem)] items-center justify-center",
  loadingContent: `${glassPanel} rounded-lg p-8 text-center`,
  loadingSpinner:
    "mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300",
  loadingTitle: "mb-2 text-xl font-black text-white",
  loadingDescription: "text-sm text-slate-300",
  customStyles: `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .sidebar-content { -webkit-overflow-scrolling: touch; }
    .sidebar-content::-webkit-scrollbar { width: 10px; }
    .sidebar-content::-webkit-scrollbar-track { background: transparent; }
    .sidebar-content::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.16); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
    .sidebar-content { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.16) transparent; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
    }
  `,
};

export const resultStyles = {
  pageContainer:
    "min-h-screen bg-slate-950 p-4 text-white sm:p-6 md:pl-28 [color-scheme:dark] bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.15),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,.12),transparent_25%)]",
  container: "mx-auto max-w-7xl",
  header: "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
  title: "text-3xl font-black tracking-normal text-white md:text-4xl",
  headerControls: "flex items-center gap-3",
  filterContainer: "mb-6",
  filterContent:
    "flex flex-col gap-3 rounded-lg border border-white/10 bg-white/10 p-3 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between",
  filterButtons: "flex flex-wrap items-center gap-2",
  filterLabel: "mr-1 text-sm font-bold text-slate-300",
  filterButton:
    "rounded-lg border px-3 py-2 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60",
  filterButtonActive:
    "border-cyan-300/30 bg-cyan-300 text-slate-950 shadow-cyan-950/20",
  filterButtonInactive:
    "border-white/10 bg-white/10 text-slate-200 hover:border-cyan-300/25 hover:bg-white/15",
  filterStatus: "text-sm font-semibold text-slate-400",
  loadingContainer: `${glassPanel} rounded-lg py-20 text-center`,
  loadingSpinner:
    "mb-4 inline-block h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300",
  loadingText: "text-slate-300",
  trackSection: "mb-7",
  trackTitle: "mb-4 text-xl font-black text-white",
  resultsGrid: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
  emptyState: `${glassPanel} rounded-lg py-14 text-center text-slate-300`,
  badgeExcellent:
    "inline-flex items-center rounded-md bg-emerald-300/15 px-2.5 py-1 text-xs font-black text-emerald-100",
  badgeGood:
    "inline-flex items-center rounded-md bg-cyan-300/15 px-2.5 py-1 text-xs font-black text-cyan-100",
  badgeAverage:
    "inline-flex items-center rounded-md bg-amber-300/15 px-2.5 py-1 text-xs font-black text-amber-100",
  badgeNeedsWork:
    "inline-flex items-center rounded-md bg-rose-400/15 px-2.5 py-1 text-xs font-black text-rose-100",
  card:
    "relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] shadow-xl shadow-black/15 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/10",
  cardAccent:
    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300",
  cardContent: "flex h-full flex-col p-5",
  cardHeader: "flex items-start justify-between gap-3",
  cardInfo: "flex min-w-0 items-center gap-3",
  levelAvatar:
    "grid h-12 w-12 shrink-0 place-items-center rounded-lg text-lg font-black",
  levelBasic: "bg-sky-300/15 text-sky-100",
  levelIntermediate: "bg-amber-300/15 text-amber-100",
  levelAdvanced: "bg-rose-300/15 text-rose-100",
  cardText: "min-w-0",
  cardTitle: "truncate text-sm font-black text-white md:text-base",
  cardMeta: "mt-1 text-xs font-semibold text-slate-400",
  cardPerformance: "shrink-0 text-right",
  performanceLabel: "text-xs font-bold uppercase tracking-[0.12em] text-slate-500",
  badgeContainer: "mt-1",
  cardStats: "mt-5 grid grid-cols-3 gap-2",
  statItem:
    "rounded-lg border border-white/10 bg-black/20 p-3 text-xs font-bold text-slate-400",
  statNumber: "mt-1 block text-lg font-black text-white",
};
