type IconProps = { className?: string };

const base = (children: React.ReactNode, className = "h-5 w-5") => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const IconDashboard = ({ className }: IconProps) =>
  base(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>,
    className
  );

export const IconLeads = ({ className }: IconProps) =>
  base(
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </>,
    className
  );

export const IconCrm = ({ className }: IconProps) =>
  base(
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <circle cx="17" cy="7" r="2.3" />
      <path d="M15.3 14.3c2.6.2 4.7 2.2 4.7 5.2" />
    </>,
    className
  );

export const IconAgents = ({ className }: IconProps) =>
  base(
    <>
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1.1" />
      <circle cx="9" cy="13.5" r="1.2" />
      <circle cx="15" cy="13.5" r="1.2" />
      <path d="M8 18.5h8" />
    </>,
    className
  );

export const IconTasks = ({ className }: IconProps) =>
  base(
    <>
      <path d="M4 7h4M4 12h4M4 17h4" />
      <path d="M11 7h9M11 12h9M11 17h9" opacity="0.001" />
      <path d="M9.5 7l1.6 1.6L14 5.7" />
    </>,
    className
  );

export const IconFinance = ({ className }: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15.5s.9 1.3 3 1.3 3.3-1 3.3-2.2c0-3-6.3-1.3-6.3-4.2 0-1.2 1.3-2.2 3.3-2.2 1.8 0 2.7 1 2.7 1" />
      <path d="M12 6.3v1.2M12 16.5v1.2" />
    </>,
    className
  );

export const IconGoals = ({ className }: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>,
    className
  );

export const IconAdvisor = ({ className }: IconProps) =>
  base(
    <>
      <path d="M12 3.5l1.6 3.9 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" />
      <path d="M19 15l.8 1.9 2 .8-2 .8-.8 1.9-.8-1.9-2-.8 2-.8z" />
    </>,
    className
  );

export const IconLogout = ({ className }: IconProps) =>
  base(
    <>
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h6A1.5 1.5 0 0118 5.5v13a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 019 18.5V17" />
      <path d="M3 12h11.5M11 8.5L14.5 12 11 15.5" />
    </>,
    className
  );

export const IconMenu = ({ className }: IconProps) =>
  base(
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>,
    className
  );

export const IconClose = ({ className }: IconProps) =>
  base(
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>,
    className
  );

export const IconChevronRight = ({ className }: IconProps) =>
  base(<path d="M9 5l7 7-7 7" />, className);

export const IconPlus = ({ className }: IconProps) => base(<path d="M12 5v14M5 12h14" />, className);

export const IconCheck = ({ className }: IconProps) => base(<path d="M5 13l4 4L19 7" />, className);

export const IconAlert = ({ className }: IconProps) =>
  base(
    <>
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.6 3.9L2.9 18a1.6 1.6 0 001.4 2.4h15.4a1.6 1.6 0 001.4-2.4L13.4 3.9a1.6 1.6 0 00-2.8 0z" />
    </>,
    className
  );
