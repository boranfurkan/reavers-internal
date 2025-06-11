import { config } from '../../../config';
import { getWithExpiry, setWithExpiry } from '../../../utils/helpers';
import { MissionStats } from '../../types';

export const fetchMissions = async (
  layer: number,
  missionType: string,
  refresh: boolean = false,
) => {
  const resultMissions: any[] = [];
  const localStored =
    getWithExpiry<{
      [path: string]: (MissionStats & any)[];
    }>('missions', 'all', true) || {};

  // const localStoredMissions: (MissionStats & any)[] | undefined =
  //   localStored[`layer-${layer}/${missionType}`];

  // const localStoredVersion = localStorage.getItem('code_version');

  // if (!refresh && localStoredMissions && localStoredMissions.length > 0 && localStoredVersion === config.code_version) {
  //   resultMissions.push(...localStoredMissions);
  // } else {
  const endpoint = `${config.worker_server_url}/missions?layer=${layer}&missionType=${missionType}`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseBody = await res.json();

  if (res.status !== 200) {
    const errorMessage = responseBody.error;
    throw new Error(errorMessage || 'An error occurred, try again later');
  }

  const missions = (responseBody as MissionStats[]).map(
    (missionData: MissionStats & any) => {
      // Calculating color
      let color;
      if (missionData.riskLevel === 1) color = '#19d362';
      if (missionData.riskLevel === 2) color = '#dbcd15';
      if (missionData.riskLevel === 3) color = '#db6515';
      if (missionData.riskLevel === 4) color = '#db3515';
      if (missionData.riskLevel === 5) color = '#db1515';

      return {
        ...missionData,
        kind: missionType,
        path: (missionData.ref._path.segments as string[]).reduce(
          (prevVal, currVal) => prevVal + '/' + currVal,
          '',
        ),
        color,
      };
    },
  );

  const updateCodeVersion = () => {
    localStorage.setItem('code_version', `${config.code_version}`);
  };

  resultMissions.push(...missions);
  localStored[`layer-${layer}/${missionType}`] = missions;
  setWithExpiry('missions', 'all', localStored, 12 * 60 * 60 * 1000, true);
  updateCodeVersion();
  // }
  return resultMissions;
};
