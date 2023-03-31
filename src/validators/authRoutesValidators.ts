import * as yup from 'yup'

export const signupApplicantSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
    name: yup.string().required(),
    education: yup.string().required(),
    skills: yup.array().of(yup.string().required('skill is required')).required(),
    yearsOfExperience: yup.number().required(),
  })
})