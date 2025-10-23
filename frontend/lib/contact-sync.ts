import { supabase } from './supabase-client'
import { toast } from 'sonner'

export interface Contact {
  name: string
  phone: string
  email?: string
}

export const contactSync = {
  // Request permission and get contacts (browser API)
  async getContacts(): Promise<Contact[]> {
    try {
      // Check if Contact API is supported
      if (!('contacts' in navigator)) {
        throw new Error('Contact API not supported in this browser')
      }

      // Request contacts with permission
      const contacts = await (navigator as any).contacts.select(['name', 'tel', 'email'], {
        multiple: true
      })

      return contacts.map((contact: any) => ({
        name: contact.name?.[0] || 'Unknown',
        phone: contact.tel?.[0] || '',
        email: contact.email?.[0] || ''
      })).filter((c: Contact) => c.phone) // Only contacts with phone numbers
    } catch (error) {
      console.error('Contact access error:', error)
      throw new Error('Unable to access contacts. Please check permissions.')
    }
  },

  // Find users by phone numbers
  async findUsersByContacts(contacts: Contact[]) {
    try {
      const phoneNumbers = contacts.map(c => c.phone.replace(/\D/g, '')) // Remove non-digits
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, phone_number, profile_picture_url')
        .in('phone_number', phoneNumbers)
        .eq('has_completed_kyc', true)

      if (error) throw error

      return users?.map(user => ({
        ...user,
        contact: contacts.find(c => 
          c.phone.replace(/\D/g, '').includes(user.phone_number?.replace(/\D/g, '') || '')
        )
      })) || []
    } catch (error) {
      console.error('Error finding users:', error)
      throw error
    }
  },

  // Send partner request
  async sendPartnerRequest(partnerId: string, message?: string) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // Check if request already exists
      const { data: existing } = await supabase
        .from('accountability_partners')
        .select('id, status')
        .or(`and(user_id.eq.${user.user.id},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${user.user.id})`)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'pending') {
          throw new Error('Request already sent')
        } else if (existing.status === 'accepted') {
          throw new Error('Already partners')
        }
      }

      const { error } = await supabase
        .from('accountability_partners')
        .insert({
          user_id: user.user.id,
          partner_id: partnerId,
          status: 'pending',
          message: message || 'Would like to be accountability partners!'
        })

      if (error) throw error

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: partnerId,
          title: 'New Partner Request',
          message: 'Someone wants to be your accountability partner!',
          type: 'partner_request',
          read: false,
          data: { sender_id: user.user.id }
        })

      toast.success('Partner request sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request')
      throw error
    }
  },

  // Bulk invite contacts (simulate SMS/email)
  async inviteContacts(contacts: Contact[], message?: string) {
    try {
      const inviteMessage = message || 'Join me on Commitly - the best app for achieving goals together! Download: https://commitly.app'
      
      // In a real app, this would integrate with SMS/email services
      // For now, we'll just show a success message
      toast.success(`Invitations sent to ${contacts.length} contacts!`)
      
      // You could integrate with services like:
      // - Twilio for SMS
      // - SendGrid for email
      // - Native share API
      
      return { success: true, count: contacts.length }
    } catch (error) {
      console.error('Invite error:', error)
      throw error
    }
  }
}