import { config } from '../../../config';
import { getSignature } from '../../../utils/getSignature';

export const updateUsername = async (username: string, jwtToken: string) => {
	const endpoint = `${config.worker_server_url}/users/update/username`;

	const signature = getSignature(
		JSON.stringify({
			username
		})
	);

	const res = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${jwtToken}`
		},
		body: JSON.stringify({
			data: {
				username
			},
			signature
		})
	});
	const responseBody = await res.json();

	if (res.status !== 200) {
		const errorMessage = responseBody.error;
		throw new Error(errorMessage || 'An error occurred, try again later');
	}

	return responseBody.done ? (responseBody.done as boolean) : false;
};
