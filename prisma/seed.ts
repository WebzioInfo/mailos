import 'dotenv/config'
import { PrismaClient, GlobalRole, WorkspaceRole, EncryptionType, CampaignStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Biofix Workspace...')

  // 1. User
  const email = 'biofixofficial@gmail.com'
  const name = 'Biofix Technologies'
  const passwordHash = await bcrypt.hash('Password123!', 10)

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: GlobalRole.USER,
      },
    })
    console.log(`Created new user: ${email}`)
  } else {
    console.log(`User already exists: ${email}`)
  }

  // 2. Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: user.id, role: WorkspaceRole.OWNER } } }
  })

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Biofix Technologies',
        members: {
          create: {
            userId: user.id,
            role: WorkspaceRole.OWNER,
          }
        }
      }
    })
    console.log(`Created new workspace for user`)
  } else {
    console.log(`Found existing workspace`)
  }

  // 3. Sender Profile (SMTPProfile)
  let smtpProfile = await prisma.sMTPProfile.findFirst({
    where: { workspaceId: workspace.id, senderEmail: email }
  })
  
  if (!smtpProfile) {
    smtpProfile = await prisma.sMTPProfile.create({
      data: {
        workspaceId: workspace.id,
        name: 'Biofix SMTP',
        host: 'smtp.gmail.com',
        port: 587,
        username: email,
        senderName: 'Biofix Technologies',
        senderEmail: email,
        encryption: EncryptionType.TLS,
      }
    })
    console.log('Created SMTP Profile')
  }

  // Set User Profile (Signature/Footer)
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      signature: 'Team Biofix\nPhone: +91 7510510947\nWebsite: https://biofix.in',
      emailFooter: 'This email was sent using Biofix Technologies.',
      defaultSenderName: 'Biofix Technologies',
      defaultSenderEmail: email,
    },
    create: {
      userId: user.id,
      signature: 'Team Biofix\nPhone: +91 7510510947\nWebsite: https://biofix.in',
      emailFooter: 'This email was sent using Biofix Technologies.',
      defaultSenderName: 'Biofix Technologies',
      defaultSenderEmail: email,
    }
  })
  console.log('Upserted User Profile')

  // 4. Contact Group (List)
  let contactList = await prisma.list.findFirst({
    where: { workspaceId: workspace.id, name: 'Kerala Food Safety Officers' }
  })

  if (!contactList) {
    contactList = await prisma.list.create({
      data: {
        workspaceId: workspace.id,
        name: 'Kerala Food Safety Officers',
      }
    })
    console.log('Created Contact Group')
  }

  // 5. Contacts
  const contactsData = [
    { firstName: 'ACFS', lastName: 'Kollam', email: 'dfikollam@gmail.com' },
    { firstName: 'Food Safety', lastName: 'PTA', email: 'foodsafetyptaadoor@gmail.com' },
    { firstName: 'ACFS', lastName: 'Alappuzha', email: 'acfsalappuzha19@gmail.com' },
    { firstName: 'District Food Inspector', lastName: 'Kottayam', email: 'dfiktm@gmail.com' },
    { firstName: 'DFSO', lastName: 'Idukki', email: 'districtfiidukki@gmail.com' },
    { firstName: 'ACFS', lastName: 'Ernakulam', email: 'dfiernakulam@gmail.com' },
    { firstName: 'ACFS', lastName: 'Thrissur', email: 'acfsthrissur@gmail.com' },
    { firstName: 'ACFS', lastName: 'Malappuram', email: 'acfsomlpm@gmail.com' },
    { firstName: 'ACFS', lastName: 'Kozhikode', email: 'acfskozhikode@gmail.com' },
  ]

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: { workspaceId_email: { workspaceId: workspace.id, email: c.email } },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        lists: { connect: { id: contactList.id } }
      },
      create: {
        workspaceId: workspace.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        lists: { connect: { id: contactList.id } }
      }
    })
  }
  console.log('Upserted Contacts')

  // 6. Tags
  const tagNames = ['Food Safety', 'Government', 'Kerala', 'Compliance']
  const tagIds = []
  for (const t of tagNames) {
    const tag = await prisma.tag.findFirst({
      where: { workspaceId: workspace.id, name: t }
    })
    if (!tag) {
      const newTag = await prisma.tag.create({
        data: { workspaceId: workspace.id, name: t }
      })
      tagIds.push(newTag.id)
    } else {
      tagIds.push(tag.id)
    }
  }
  console.log('Upserted Tags')

  // Tag all contacts
  const allContacts = await prisma.contact.findMany({ where: { workspaceId: workspace.id } })
  for (const c of allContacts) {
    await prisma.contact.update({
      where: { id: c.id },
      data: {
        tags: {
          connect: tagIds.map(id => ({ id }))
        }
      }
    })
  }

  // 7. Template
  const templateName = 'Greetings From Biofix'
  const subject = 'Greetings from Biofix'
  const htmlContent = `<p>Dear Sir/Madam,</p>
<p>Greetings from Biofix.</p>
<p>Biofix is a quality-driven organization supporting the food, beverage, and packaged drinking water sectors with products, services, technical guidance, and compliance solutions.</p>
<p>Backed by continuous research and industry expertise, we work closely with manufacturers, laboratories, and solution providers across India and international markets.</p>
<p>As standards and regulations continue to evolve, our team actively follows updates from FSSAI and BIS to help organizations stay aligned with quality, safety, and compliance requirements.</p>
<p>Our objective is to be a dependable knowledge and service partner for organizations committed to delivering safe and quality products to the public.</p>
<p>We look forward to associating with Food Safety Officers across Kerala and welcome opportunities to collaborate, share knowledge, and contribute towards strengthening food safety and quality standards together.</p>
<p>Warm Regards,</p>
<p>Team Biofix<br>+91 7510510947<br>Biofix</p>`

  let template = await prisma.template.findFirst({
    where: { workspaceId: workspace.id, name: templateName }
  })

  if (!template) {
    template = await prisma.template.create({
      data: {
        workspaceId: workspace.id,
        name: templateName,
        html: htmlContent,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'HTML content is used' }] }] },
      }
    })
    console.log('Created Template')
  }

  // 8. Campaign
  let campaign = await prisma.campaign.findFirst({
    where: { workspaceId: workspace.id, name: 'Biofix Introduction Campaign' }
  })

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        name: 'Biofix Introduction Campaign',
        subject: subject,
        status: CampaignStatus.DRAFT,
        smtpProfileId: smtpProfile.id,
        templateId: template.id,
      }
    })
    console.log('Created Campaign')
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
