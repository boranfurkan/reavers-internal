type ProjectConfig = {
  projectId: string;
  baseUrl: string;
  storageUrl: string;
  functionsUrl: string;
};

const projectConfigs: Record<string, ProjectConfig> = {
  'reavers-56900': {
    projectId: 'reavers-56900',
    baseUrl: 'ew.r.appspot.com',
    storageUrl: 'https://storage.googleapis.com/reavers-56900.appspot.com',
    functionsUrl: 'https://us-central1-reavers-56900.cloudfunctions.net'
  },
  'reavers-instance-2': {
    projectId: 'reavers-instance-2',
    baseUrl: 'ew.r.appspot.com',
    storageUrl: 'https://storage.googleapis.com/reavers-instance-2.appspot.com',
    functionsUrl: 'https://us-central1-reavers-instance-2.cloudfunctions.net'
  }
};

export const getProjectConfig = (projectName: string): ProjectConfig => {
  if (!projectConfigs[projectName]) {
    console.warn(`Project config not found for ${projectName}, using default`);
    return projectConfigs['reavers-56900'];
  }
  return projectConfigs[projectName];
};

const getWorkerUrl = (environment: string) => {
  const projectName = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_NAME || 'reavers-56900';
  const { baseUrl, projectId } = getProjectConfig(projectName);

  if (process.env.NEXT_PUBLIC_LOCAL === 'true') {
    return 'http://localhost:8080/api';
  }

  return `https://${environment}-dot-default-dot-${projectId}.${baseUrl}/api`;
};