import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Image from 'next/image';
import { updateProfilePicture } from '../../lib/api/user/updateProfilePicture';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../config';
import { useDynamicContextWrapper } from '../../hooks/UseDynamicContextWrapper';

function ProfileImage() {
  const [file, setFile] = useState<File | null>(null);
  const [updating, isUpdating] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { primaryWallet } = useDynamicContextWrapper();
  const user = useUser();
  const auth = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = event.target.files?.[0];
    if (targetFile) {
      setFile(targetFile);
    }
  };

  const handleProfileImgUpdate = async () => {
    if (primaryWallet && primaryWallet.publicKey && file && auth.jwtToken) {
      try {
        const result = await updateProfilePicture(file, auth.jwtToken);

        if (result) {
          mutate(`${config.worker_server_url}/users/me`); // Trigger a re-fetch of the user data
          setFile(null);
        } else {
          toast.error('An error occurred while trying to upload file');
        }
      } catch (error: any) {
        // Handle error
        toast.error(error.message);
        setFile(null);
      }
    }
  };

  useEffect(() => {
    if (file) {
      isUpdating(true);
      handleProfileImgUpdate().finally(() => {
        isUpdating(false);
      });
    }
  }, [file]);

  return (
    <>
      <div className="absolute -top-14 left-0 right-0 z-20 ml-auto mr-auto flex w-fit max-w-4xl flex-col items-center justify-center gap-4">
        <div className="relative">
          {user.user?.profilePicture || previewUrl ? (
            !updating ? (
              <Image
                src={previewUrl ? previewUrl : user.user!.profilePicture}
                alt="Preview"
                className="h-40 w-40 rounded-lg bg-center bg-no-repeat object-contain"
                width={320}
                height={320}
                unoptimized
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-black bg-center bg-no-repeat object-contain">
                <Spin />
              </div>
            )
          ) : (
            <div className="flex h-40 w-40 flex-col items-center justify-center border border-dotted border-profile-stroke bg-black  bg-opacity-10 backdrop-blur-2xl">
              <span className="text-xl font-bold">+</span> <br /> Add Image
            </div>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            accept=".png, .jpg, .gif"
            className="absolute left-0 top-0 z-[100] h-40 w-40 cursor-pointer opacity-0"
          />
        </div>
      </div>
      {(user.user?.profilePicture || previewUrl) && (
        <div className="absolute left-0 top-0 z-0 h-[20vh] w-full overflow-hidden opacity-20 blur-lg drop-shadow-none">
          <Image
            src={previewUrl ? previewUrl : user.user!.profilePicture}
            alt=""
            fill
            unoptimized
          />
        </div>
      )}
    </>
  );
}

export default ProfileImage;
