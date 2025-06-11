import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { updateUsername } from '../../lib/api/user/updateUsername';
import validator from 'validator';
import { useAuth } from '../../contexts/AuthContext';
import { mutate } from 'swr';
import { config } from '../../config';
import { toast } from 'sonner';
import { useDynamicContextWrapper } from '../../hooks/UseDynamicContextWrapper';

function ProfileName() {
  const { primaryWallet } = useDynamicContextWrapper();
  const [previewName, setPreviewName] = useState('');
  const [name, setName] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (user && user.user) {
      setName(user.user.username);
    }
  }, [user, name]); // Add 'name' as a dependency

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileNameUpdate = async () => {
    if (primaryWallet && primaryWallet.publicKey && auth.jwtToken) {
      try {
        await updateUsername(previewName, auth.jwtToken);
        setName(previewName); // Update the name state with the new name
        mutate(`${config.worker_server_url}/users/me`); // Trigger a re-fetch of the user data
        setIsChanged(false);
        setPreviewName('');
        toggleEdit();
      } catch (error) {
        toast.error('Error updating profile name');
      }
    }
  };

  function sanitizeAndLimitInput(input: string, maxLength: number) {
    let sanitizedInput = validator.escape(input);
    if (sanitizedInput.length > maxLength) {
      sanitizedInput = sanitizedInput.substring(0, maxLength);
    }
    return sanitizedInput;
  }

  const cancelNameEdit = () => {
    setPreviewName(name);
    toggleEdit();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = sanitizeAndLimitInput(event.target.value, 20); // Limit to 20 characters
    setPreviewName(sanitizedInput);
    setIsChanged(true);
  };

  return (
    <div className="flex h-20 w-full flex-row items-center justify-center gap-4">
      {isEditing ? (
        <>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs bg-transparent outline-reavers-stroke"
            value={previewName}
            onChange={handleNameChange}
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                handleProfileNameUpdate();
              }
            }}
          />
          {isChanged && (
            <button
              onClick={handleProfileNameUpdate}
              className="btn btn-primary btn-sm border-profile-stroke bg-transparent bg-opacity-60 hover:border-reavers-bg hover:bg-reavers-bg">
              Save
            </button>
          )}
          <button
            onClick={cancelNameEdit}
            className="btn btn-primary btn-sm border-profile-stroke bg-transparent bg-opacity-60 hover:border-reavers-bg hover:bg-reavers-bg">
            Cancel
          </button>
        </>
      ) : (
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-2xl font-semibold">{previewName || name}</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mb-4 h-3 w-3 cursor-pointer"
            onClick={toggleEdit}>
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default ProfileName;
