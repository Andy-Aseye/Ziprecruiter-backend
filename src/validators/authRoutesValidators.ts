import * as yup from 'yup'

export const signupApplicantSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
    name: yup.string().required(),
    education: yup.string().required(),
    skills: yup.string().required(),
    yearsOfExperience: yup.number().required(),
  })
})

export const signupRecruiterSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
    name: yup.string().required(),
    organization: yup.string().required(),
    position: yup.string().required(),
    contactNumber: yup.string().required(),
  })
})

export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
})