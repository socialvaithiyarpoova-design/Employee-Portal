export function getOrSetSessionId() {
  let session_id = localStorage.getItem('session_id');
  if (!session_id) {
    session_id = generateUUID();
    localStorage.setItem('session_id', session_id);
  }
  return session_id;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
