import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'sonner';
import { config } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { mutate } from 'swr';

function Socials() {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const user = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (
      user.user?.twitterData == null ||
      user.user?.twitterData == undefined ||
      Object.keys(user.user?.twitterData).length == 0
    )
      setTwitterConnected(false);
    else {
      setTwitterUsername(user.user.twitterData.username);
      setTwitterConnected(true);
    }

    if (
      user.user?.discordData == null ||
      user.user.discordData == undefined ||
      Object.keys(user.user.discordData).length == 0
    )
      setDiscordConnected(false);
    else {
      setDiscordUsername(user.user.discordData.username);
      setDiscordConnected(true);
    }
  }, [user]);

  const handleSignIn = (provider: string) => {
    const idToken = auth.jwtToken;
    if (provider == 'discord')
      window.open(
        `${config.worker_server_url}/auth/discord/login?token=${idToken}`,
        '_self',
      );
    else if (provider === 'twitter')
      window.open(
        `${config.worker_server_url}/auth/twitter/login?token=${idToken}`,
        '_self',
      );
  };

  const unLinkSocial = async (provider: string) => {
    const idToken = auth.jwtToken;
    if (provider == 'discord' || provider == 'twitter') {
      try {
        if (provider == 'discord') {
          await fetch(
            `${config.worker_server_url}/auth/discord/disconnet?token=${idToken}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
        } else if (provider === 'twitter') {
          await fetch(
            `${config.worker_server_url}/auth/twitter/disconnet?token=${idToken}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
        }

        // Let database process it for 1 second
        setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
        }, 1000);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="relative z-30 -ml-4 flex w-full flex-col items-start justify-start gap-2 p-8 pt-6 md:ml-0">
      <div className="myConnect flex w-full flex-row items-center justify-start gap-4">
        <svg
          xmlns="https://discord.gg/TAhQRHP6dU"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16">
          <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
        </svg>
        {discordConnected ? (
          <span
            style={{
              display: 'contents',
            }}>
            {discordUsername}
            <button
              onClick={() => unLinkSocial('discord')}
              className="cursor-pointer">
              disconnect
            </button>
          </span>
        ) : (
          <button
            onClick={() => handleSignIn('discord')}
            className="cursor-pointer">
            Connect
          </button>
        )}
      </div>
      <div className="myConnect flex w-full flex-row items-center justify-start gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="fill-current">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
        </svg>
        {twitterConnected ? (
          <span
            style={{
              display: 'contents',
            }}>
            connected
            <button
              onClick={() => unLinkSocial('twitter')}
              className="cursor-pointer">
              disconnect
            </button>
          </span>
        ) : (
          <button
            onClick={() => handleSignIn('twitter')}
            className="cursor-pointer">
            Connect
          </button> // signIn("twitter") // window.location.href = '/api/auth/twitter'
        )}
      </div>
    </div>
  );
}

export default Socials;
