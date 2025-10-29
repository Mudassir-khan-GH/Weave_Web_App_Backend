import bcrypt from 'bcrypt'

const hashPassword = async (plainPassword) => {
  const hash = await bcrypt.hash(plainPassword, 10);
  return hash;
};


const comparePassword = async (plainPassword, encryptedPassword) => {
    bcrypt.compare(plainPassword, encryptedPassword, function(err, result) {
        if(!err) return result;
    });
}

export {hashPassword, comparePassword};