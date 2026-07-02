const paths = {
  activity: "M22 12h-4l-3 7-6-14-3 7H2",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  chart: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8",
  check: "m4 12 5 5L20 6",
  chevron: "m9 18 6-6-6-6",
  clipboard: "M9 4h6M9 4a3 3 0 0 1 6 0M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 12h6M9 16h6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2ZM14 2v6h6M8 13h8M8 17h5",
  filter: "M3 5h18M6 12h12M10 19h4",
  home: "M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10",
  hospital: "M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M9 21v-6h6v6M9 8h6M12 5v6M4 21h16",
  logout: "M10 17l5-5-5-5M15 12H3M21 3v18",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  plus: "M12 5v14M5 12h14",
  refresh: "M20 6v5h-5M4 18v-5h5M18 9a7 7 0 0 0-11.8-3M6 15a7 7 0 0 0 11.8 3",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  stethoscope: "M6 3v5a4 4 0 0 0 8 0V3M6 3H4M14 3h2M10 12v3a5 5 0 0 0 10 0v-2M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  users: "M17 21a6 6 0 0 0-12 0M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21a5 5 0 0 0-6-4.9M17 3.5a3.5 3.5 0 0 1 0 7",
};

function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={paths[name] || paths.activity} />
    </svg>
  );
}

export default Icon;
