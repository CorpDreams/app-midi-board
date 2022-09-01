/**
 * This is a fake user system where uid is generated randomly.
 * We want it to be the same even when refreshed the page,
 * so we store it in the querystring.
 *
 * For anyone who want to test multi-player apps, you can just edit the
 * uid in querystring to simulate different users.
 */
export function get_uid() {
  const query = new URLSearchParams(location.search);
  let uid = query.get("uid");
  if (!uid) {
    uid = Math.random().toString(36).slice(2);
    update_query({ uid });
  }
  console.debug("uid =", uid);
  return uid;
}

export function get_query() {
  const query = new URLSearchParams(location.search);
  let uid = query.get("uid");
  let VITE_APPID = query.get("VITE_APPID");
  let VITE_ROOM_UUID = query.get("VITE_ROOM_UUID");
  let VITE_ROOM_TOKEN = query.get("VITE_ROOM_TOKEN");
  if (!uid) {
    uid = Math.random().toString(36).slice(2);
    update_query({ uid });
  }
  if(!VITE_APPID || !VITE_APPID || !VITE_ROOM_UUID){
    let env = import.meta.env
    VITE_APPID = env.VITE_APPID
    VITE_ROOM_UUID = env.VITE_ROOM_UUID
    VITE_ROOM_TOKEN = env.VITE_ROOM_TOKEN
    update_query({ VITE_APPID, VITE_ROOM_UUID, VITE_ROOM_TOKEN });
  }
  console.debug("uid =", uid);
  return {
    uid,
    VITE_APPID,
    VITE_ROOM_UUID,
    VITE_ROOM_TOKEN
  };
}

function update_query(set: Record<string, string | undefined>) {
  const query = new URLSearchParams(location.search);
  for (const key of Object.keys(set)) {
    if (set[key] === undefined) {
      query.delete(key);
    } else {
      query.set(key, set[key]!);
    }
  }
  history.replaceState(null, "", "?" + query.toString());
}
