import bcrypt from 'bcrypt'

const hashPassword = async (plainPassword) => {
  const hash = await bcrypt.hash(plainPassword, 10);
  return hash;
};


const comparePassword = async (plainPassword, encryptedPassword) => {
    const result= await bcrypt.compare(plainPassword, encryptedPassword)
    return result
}

export {hashPassword, comparePassword};