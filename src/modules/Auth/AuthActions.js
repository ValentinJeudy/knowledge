import { types } from './AuthMutations'
import { post } from '@/lib/network'

const { STORE_USER, STORE_PROJECTS } = types

export default {
  async logUser ({ commit, getters, state }, data) {
    try {
      const res = await post('api/login', data)

      if (res.data.success) {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        document.cookie = `knowledge-token=${res.data.token}; expires=${date}.`

        // Reducing projects in unique object with ids as keys, also for blocks inside projects
        const projects = res.data.projects.reduce((projects, project) => {
          return {
            ...projects,
            [project._id]: {
              ...project,
              blocks: project.blocks.reduce((blocks, block) => {
                return {
                  ...blocks,
                  [block._id]: block
                }
              }, {})
            }
          }
        }, {})

        commit(STORE_USER, res.data.user)
        commit(STORE_PROJECTS, projects)
        return true
      } else if (res.status === 401) {
        console.log('Unauthorized access')
        return false
      }
    } catch (err) {
      console.error('error ===> ', err)
      return false
    }
  }
}
