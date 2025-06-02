import argon2 from 'argon2';

async function hashPassword(password) {
    return await argon2.hash(password);
}

async function verifyPassword(password, hash) {
    return await argon2.verify(hash, password);
}

export { hashPassword, verifyPassword };