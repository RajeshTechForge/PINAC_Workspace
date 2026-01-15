export const getBackendPort = (): number | null => {
  const port = localStorage.getItem("backendPort");
  return port ? parseInt(port, 10) : null;
};

export const setBackendPort = (port: number): void => {
  localStorage.setItem("backendPort", port.toString());
};
