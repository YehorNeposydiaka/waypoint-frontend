import { supabase } from '../service/supabase'

export const uploadTripCover = async (tripId, file) => {
  if (!file) {
    return null
  }

  const filePath = `trips/${tripId}/cover`

  const { error: uploadError } = await supabase.storage
    .from('trip-covers')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('trip-covers')
    .getPublicUrl(filePath)

  return data.publicUrl
}