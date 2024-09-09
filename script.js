const contentful = require('contentful-management')

const client = contentful.createClient({
  accessToken: 'CFPAT-HQkFP1uLqlJ1AfgNXwGlh25HocdKtTKf49MrdzINw5E'
})

const spaceId = 'oen9jg6suzgv'
const environmentId = 'master'

async function updateCollectionProjects() {
  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)

  // Fetch all collections
  const collections = await environment.getEntries({
    content_type: 'collection'
  })

  for (const collection of collections.items) {
    const projectReferences = collection.fields.projects['en-US'] || []
    
    for (const projectRef of projectReferences) {
      const project = await environment.getEntry(projectRef.sys.id)
      
      // Update project's collection field
      project.fields.collection = {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: collection.sys.id
          }
        }
      }

      // Save the updated project
      await project.update()
    }
  }

  console.log('All projects updated successfully')
}

updateCollectionProjects().catch(console.error)