export default function CheckRevokedTokenInAllDevices({
  credentialsTime,
  iat,
}) {
  return new Date(Number(credentialsTime)) > new Date(Number(iat * 1000));
}
