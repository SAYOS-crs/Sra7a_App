import { Radis } from "../../DB/radis.connection.js";
// ---------- redis prefixes ----------------
export const RedisKeyPrefix = ({ userId, jti }) => {
  return `revoke-token-user:${userId}-jti:${jti}`;
};

export const RedisUserCredentials = ({ userId }) => {
  return `user:${userId}-CredentialsDate`;
};

export const RedisOTPprefix = ({ Email }) => {
  return `Email-Confirmation:${Email}`;
};

export const RedisIPprefix = (ip) => {
  return `ip:address:${ip}`;
};
// ---------- redis services---------
export const set = async ({ key, value, ttl = null, options = undefined }) => {
  try {
    const StringValue =
      typeof value == "string" ? value : JSON.stringify(value);
    if (ttl) {
      return await Radis.set(key, value, {
        expiration: { type: "EX", value: ttl },
      });
    } else if (options) {
      return await Radis.set(key, value, options);
    } else {
      return await Radis.set(key, value);
    }
  } catch (error) {
    console.log("radis set error ", error);
  }
};

export const get = async ({ key }) => {
  try {
    return Radis.get(key);
  } catch (error) {
    console.log("radis get error ", error);
  }
};

export const del = async ({ key }) => {
  try {
    return Radis.del(key);
  } catch (error) {
    console.log("radis delete error ", error);
  }
};

export const Hset = async ({ key, filds, ttl = null }) => {
  const StringValue = typeof filds == "string" ? filds : JSON.stringify(filds);
  const result = await Radis.hSet(key, filds);
  if (ttl) {
    await Radis.expire(key, ttl);
  }
  return result;
};

export const Hget_all = async ({ key }) => {
  const result = await Radis.hGetAll(key);

  return result;
};
