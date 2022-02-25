import qs from 'qs';
export function getQueryPath(path = '', query = {}) {
  const search = qs.stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

export function request(url: string, method = 'POST', data: any) {
  const opts: any = {
    method,
    headers: {
      'Content-Type':
        method == 'POST'
          ? 'application/json; charset=utf-8'
          : 'application/x-www-form-urlencoded;charset=utf-8',
    },
  };

  if (method == 'POST') {
    opts.body = JSON.stringify(data);
  } else if (method == 'GET') {
    data && url == getQueryPath(url, data);
  }

  return fetch(url, opts)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response;
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}
