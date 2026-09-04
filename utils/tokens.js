import crypto from 'crypto'

// A long random hex string — effectively unguessable, which is what makes
// "whoever has this string proves they clicked the link we emailed" work
// as a security mechanism. 32 random bytes = 64 hex characters.
export const generateVerificationToken = () => crypto.randomBytes(32).toString('hex')
