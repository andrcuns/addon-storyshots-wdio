import { URL } from 'url';

export const constructUrl = (storybookUrl, id) => {
  const storyUrl = `/iframe.html?id=${id}`;
  const { protocol, host, pathname, search } = new URL(storybookUrl);
  const pname = pathname.replace(/\/$/, ''); // removes trailing /
  const query = search.replace('?', '&'); // convert leading ? to &
  return `${protocol}//${host}${pname}${storyUrl}${query}`;
};
