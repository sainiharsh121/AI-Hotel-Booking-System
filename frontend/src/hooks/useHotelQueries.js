// frontend/src/hooks/useHotelQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = '/api'

export function useRooms(showAll = true) {
  return useQuery({
    queryKey: ['rooms', { showAll }],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/rooms?all=${showAll}`)
      if (!res.ok) throw new Error('Failed to fetch rooms')
      return res.json()
    }
  })
}

export function useBookings(userId = null) {
  return useQuery({
    queryKey: ['bookings', { userId }],
    queryFn: async () => {
      const url = userId ? `${API_BASE}/bookings?user_id=${userId}` : `${API_BASE}/bookings`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch bookings')
      return res.json()
    },
    enabled: true
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId) => {
      const res = await fetch(`${API_BASE}/cancel/${bookingId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to cancel booking')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}
