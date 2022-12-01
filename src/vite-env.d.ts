/// <reference types="vite/client" />

interface JsonResult {
  code: string | number;
  msg: string;
  data?: any;
  user?: object;
}

interface AppIndexProps {
  collapsed: boolean;
  onCollapse?: (collapse: boolean) => void;
}
