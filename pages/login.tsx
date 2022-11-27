import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useClaimNFT, useLogin, useLogout, useProgram, useUser, useDropUnclaimedSupply, useNFTs } from '@thirdweb-dev/react/solana'
import { wallet } from './_app'
import { useRouter } from 'next/router'
import { NFT } from '@thirdweb-dev/sdk'
import Link from 'next/link'
import Image from 'next/image'
import astronaut from '../assets/astronaut.jpg'

type Props = {}

const login = (props: Props) => {
    const [usersNft, setUsersNft] = useState<NFT | undefined>()
    const login = useLogin()
    const logout = useLogout()
    const router = useRouter()
    const { user } = useUser()
    const { publicKey, connect, select } = useWallet()

    const { program } = useProgram(process.env.NEXT_PUBLIC_PROGRAM_ADDRESS, 'nft-drop')

    const { data: unclaimedSupply } = useDropUnclaimedSupply(program)
    const { data: nfts, isLoading } = useNFTs(program)
    const { mutateAsync: claim } = useClaimNFT(program)

    useEffect(() => {
        if (!publicKey) {
            select(wallet.name)
            connect()
        }

    }, [publicKey, wallet])

    useEffect(() => {
        if (!user || !nfts) return

        const usersNfts = nfts.find((nft) => nft.owner === user?.address)

        if (usersNfts) {
            setUsersNft(usersNfts)
        }

    }, [nfts, user])

    const handleLogin = async () => {
        await login()
        router.replace('/')
    }

    const handlePurchase = async () => {
        await claim({ amount: 1, })
        router.replace('/')
    }

    return (
        <div className=' flex min-h-screen flex-col items-center justify-center text-center bg-black'>
            <div className=' absolute top-56 left-0 w-full h-1/4 bg-[#82EEFD] -skew-y-6 z-10 overflow-hidden shadow-xl' />
            <Image className=' mt-5 z-30 shadow-2xl mb-10 rounded-full' src={astronaut} alt='logo' width={400} height={400} />
            <main className=' z-30 text-white'>
                <h1 className=' text-3xl font-bold uppercase'>Welcome to the <span className=' text-[#82EEFD]'>meta space</span></h1>
                {!user ? (
                    <div>
                        <button onClick={handleLogin} className=' text-2xl font-bold bg-[#82EEFD] text-white py-4 px-10 border-2 border-[#82EEFD] animate-pulse rounded-md transition duration-200 mt-5'>
                            Login / Connect Wallet
                        </button>
                    </div>
                ) : (
                    <>
                        <div className='px-2'>
                            <p className=' text-lg text-[#82EEFD] font-bold mb-10'>
                                Welcome {user.address.slice(0, 5)}...{user.address.slice(-5)}
                            </p>

                            {isLoading && (
                                <div className=' text-xl font-bold mb-5 bg-[#82EEFD] text-white py-4 px-10 border-2 border-[#82EEFD] animate-pulse rounded-md transition duration-200'>
                                    Hold on, we're just looking for your Meta Space Membership Pass...
                                </div>
                            )}

                            {usersNft && (
                                <Link href='/'>
                                    <a className=' text-2xl font-bold mb-5 bg-[#82EEFD] text-white py-4 px-10 border-2 border-[#82EEFD] animate-pulse rounded-md transition duration-200 hover:bg-white hover:text-[#82EEFD] mt-5 uppercase'>
                                        ACCESS GRANTED - ENTER
                                    </a>
                                </Link>
                            )}

                            {!usersNft &&
                                !isLoading &&
                                (unclaimedSupply && unclaimedSupply > 0 ? (
                                    <button onClick={handlePurchase} className=' bg-[#82EEFD] text-white py-4 px-10 border-2 border-[#82EEFD] rounded-md hover:bg-white hover:text-[#82EEFD] mt-5 uppercase font-bold transition duration-200'>
                                        Buy a Meta Space Membership Pass
                                    </button>
                                ) : (
                                    <p className=' text-2xl font-bold mb-5 bg-red-500 text-white py-4 px-10 border-2 border-red-500 rounded-md uppercase transition duration-200'>
                                        Sorry, we're all out of Meta Space Membership Passes!
                                    </p>
                                ))}
                        </div>
                        <button onClick={logout} className='bg-white text-[#82EEFD] py-4 px-10 border-2 border-[#82EEFD] rounded-md hover:bg-[#82EEFD] hover:text-white mt-10 uppercase font-bold transition duration-200'>
                            logout
                        </button>
                    </>
                )}

            </main>
        </div>
    )
}

export default login