'use client'

import { api } from '~/trpc/react'
import React, { useState } from 'react'
import { Info, CreditCard } from 'lucide-react'
import { Slider } from '~/components/ui/slider'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery()
  const [creditsToBuy, setCreditsToBuy] = useState(100)
  const [openModal, setOpenModal] = useState(false)
  const [email, setEmail] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const creditsToBuyAmount = creditsToBuy
  const price = (creditsToBuyAmount / 50).toFixed(2)

  const handleBuyCredits = () => {
    if (!email) {
      toast.error('Please enter your email for payment confirmation.')
      return
    }

    if (!paymentAmount || isNaN(Number(paymentAmount))) {
      toast.error('Please enter a valid payment amount.')
      return
    }

    toast.success(`Payment details for ${creditsToBuyAmount} credits have been sent to ${email}`)
   
    setTimeout(() => {
      toast.success('After payment confirmation, your credits will be automatically updated.')
      setOpenModal(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
      >
        Billing & Credits
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Credits</h2>
          <span className="text-3xl font-bold text-purple-600">{user?.credits}</span>
        </div>
        
        <div className="bg-white bg-opacity-60 backdrop-blur-sm px-6 py-4 rounded-lg border border-purple-100 text-purple-700 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Info className="size-5" />
            <p className="text-sm font-medium">Each credit indexes 1 file in your repository.</p>
          </div>
          <p className="text-sm ml-8">For a project with 100 files, you'll need 100 credits to index it completely.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Credits to Buy</label>
          <Slider
            defaultValue={[100]}
            max={1000}
            min={10}
            step={10}
            onValueChange={(value: number[]) => setCreditsToBuy(value[0])}
            value={[creditsToBuy]} 
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>10 credits</span>
            <span>1000 credits</span>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => setOpenModal(true)} 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            Buy {creditsToBuyAmount} credits for ${price}
          </Button>
        </div>
      </motion.div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md mx-auto p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl ">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Confirm Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email for Confirmation</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
              <Input
                id="amount"
                type="text"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>

            <div className="text-center">
              <img 
                src="/qr.webp"
                alt="Payment QR Code"
                className=" h-48 object-cover mx-auto rounded-lg shadow-md"
              />
            </div>

            <Button 
              onClick={handleBuyCredits} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Confirm Payment
            </Button>
            <p>Your Credit points will automatically updated .</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillingPage
