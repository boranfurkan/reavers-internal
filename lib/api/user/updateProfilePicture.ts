import { config } from '../../../config';

export const updateProfilePicture = async (file: File, jwtToken: string) => {
	try {
		// Check if file is an image
		if (!file.type.startsWith('image')) {
			throw new Error('Invalid file type. Only images are allowed.');
		}

		// Check if file size is less than 4MB
		const maxSize = 4 * 1024 * 1024; // 4MB in bytes
		if (file.size > maxSize) {
			throw new Error('File size exceeds the limit of 4MB.');
		}
		const endpoint = `${config.worker_server_url}/users/update/profile-picture`;

		const formData = new FormData();
		formData.append('profilePicture', file);

		const res = await fetch(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwtToken}`
			},
			body: formData
		});
		const responseBody = await res.json();

		if (res.status !== 200) {
			const errorMessage = responseBody.error;
			throw new Error(errorMessage || 'An error occurred, try again later');
		}

		return responseBody.done ? (responseBody.done as boolean) : false;
	} catch (error) {
		console.log(error);
	}
};
