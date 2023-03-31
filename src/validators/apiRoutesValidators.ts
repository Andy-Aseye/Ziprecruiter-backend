import * as yup from 'yup'

export const postJobSchema = yup.object({
  body: yup.object({
    title: yup.string().required(),
    description: yup.string().required(),
    skills: yup.array().of(yup.string()).required(),
    jobType: yup.string().required(),
    duration: yup.string().required(),
    salary: yup.string().required(),
  })
})

export const editJobSchema = yup.object({
  body: yup.object({
    salary: yup.string().notRequired(),
    duration: yup.string().notRequired(),
    deadline: yup.string().notRequired()
  }),
  params: yup.object({
    id: yup.string().required()
  })
})

export const idParamSchema = yup.object({
  params: yup.object({
    id: yup.string().required()
  })
})

export const editUserSchema = yup.object({
  body: yup.object({
    name: yup.string().notRequired(),
    organization: yup.string().notRequired(),
    position: yup.string().notRequired(),
    contactNumber: yup.string().notRequired(),
    education: yup.string().notRequired(),
    skills: yup.string().notRequired(),
    resume: yup.string().notRequired(),
    profile: yup.string().notRequired(),
  })
})

export const editApplicationSchema = yup.object({
  body: yup.object({
    status: yup.string().notRequired(),
    dateOfJoining: yup.string().notRequired(),
  }),
  params: yup.object({
    id: yup.string().required()
  })
})