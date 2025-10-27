import React from 'react';

// FIX: Update Icon helper to accept all standard SVG props for better flexibility.
// By creating a reusable type, we can easily add props like `title` for accessibility.
type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

// A helper to simplify icon components
// Now supports a `title` prop to render an accessible <title> element inside the SVG.
const Icon: React.FC<{ path: string } & IconProps> = ({ path, title, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden={!title}
    {...props}
  >
    {title && <title>{title}</title>}
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

// FIX: Update all icon components to forward SVG props to the Icon helper.
// All icon components using the helper now use the shared `IconProps` type.
export const CommentDotsIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm-3-3H6V9h9v2zm3-3H6V6h12v2z"
  />
);
export const CommentsIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"
  />
);
export const PlayIcon: React.FC<IconProps> = (props) => <Icon {...props} path="M8 5v14l11-7z" />;
export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
  />
);
export const WindowMaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M2 2h8v8H2z" />
  </svg>
);
export const WindowMinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" {...props}>
    <path d="M2 8h8v2H2z" />
  </svg>
);
export const WindowRestoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M5.5 2.5h-3v5h5v-3 M2.5 5.5v-3h5v5h-3" />
  </svg>
);
export const SignalIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path="M12 21l-8-9c2.8-2.13 6.2-3.5 10-3.5s7.2 1.37 10 3.5l-8 9z" />
);
export const SyncAltIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
  />
);
export const TimesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    {...props}
  >
    <path d="M3 3l6 6m0-6l-6 6" />
  </svg>
);
export const VolumeUpIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
  />
);
export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
  />
);
export const EnterIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path="M19 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14H3v-2h2V5h12v14h2v-2h-2z" />
);
export const ExitIcon: React.FC<IconProps> = (props) => (
  <Icon
    {...props}
    path="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
  />
);
export const WindowsLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="1" y="3" width="10" height="8" fill="#fff" opacity="0.95" />
    <rect x="13" y="3" width="10" height="8" fill="#fff" opacity="0.95" />
    <rect x="1" y="13" width="10" height="8" fill="#fff" opacity="0.95" />
    <rect x="13" y="13" width="10" height="8" fill="#fff" opacity="0.95" />
  </svg>
);
