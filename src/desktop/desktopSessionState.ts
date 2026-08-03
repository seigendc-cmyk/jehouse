let currentSourcePath: string | undefined;
export const desktopSessionState = {
  getSourcePath: () => currentSourcePath,
  setSourcePath: (path: string | undefined) => { currentSourcePath = path; }
};
