import { useState } from "react";
import { Button } from "./ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import router, { useRouter } from "next/router";
import Image from "next/image";
import { useAccount } from "wagmi";

import Link from "next/link";

const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  const router = useRouter();
  const isActive = (pathname: string) => router.pathname === pathname;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* <Vote className="h-8 w-8 text-primary mr-2" /> */}
              <Image src="/image/logo.png" alt="Logo" width={40} height={40} />
              <span onClick={() => {
                router.push("/")
              }} className="text-xl font-bold ml-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer">
                Mandat
              </span>
            </div>
          </div>

            {isConnected && (
            <nav className="hidden md:flex space-x-6 ml-10">
              <Link
              href="/petitions"
              className={`
              text-gray-300 hover:text-white relative transition-all duration-300
              ${isActive('/petitions')
                ? 'text-light-blue after:bg-blue-500 after:absolute after:bottom-0 after:top-10 after:left-0 after:w-full after:h-1 after:bg-primary-blue after:animate-pulse-glow after:rounded-full after:transition-all after:duration-300'
                : 'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all after:duration-300 hover:after:w-full'
                }
              `}
              >
              Petitions
              </Link>
              <Link
              href="/petitions/create"
              className={`
              text-gray-300 hover:text-white relative transition-all duration-300
              ${isActive('/petitions/create')
                ? 'text-light-blue after:bg-blue-500 after:absolute after:bottom-0 after:top-10 after:left-0 after:w-full after:h-1 after:bg-primary-blue after:animate-pulse-glow after:rounded-full after:transition-all after:duration-300'
                : 'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all after:duration-300 hover:after:w-full'
                }
              `}
              >
              Create
              </Link>
            </nav>
            )}

          {/* CTA Button */}
          <div className="hidden md:block">
            <ConnectButton.Custom>
              {
                ({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  // Note: If your app doesn't use authentication, you
                  // can remove all 'authenticationStatus' checks
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button className="bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white" onClick={openConnectModal} type="button">
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={openChainModal} type="button">
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <Button className="bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white" onClick={openAccountModal} type="button">
                            {chain.iconUrl && (
                              <Image
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                width={18}
                                height={18}
                              />
                            )}{account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </Button>
                        );
                      })()}
                    </div>
                  );
                }}
            </ConnectButton.Custom>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button

              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className=" bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-gray-800 px-2 pb-3 pt-2 sm:px-3 block py-2 text-gray-300 hover:text-white">
              <div className="px-3 space-y-4 py-2">

                {isConnected && (
                  <nav className="hidden md:flex space-x-6 ml-10">
                    <Link
                      href="/petitions"
                      className={`
                text-gray-300 hover:text-white relative transition-all duration-300
                ${isActive('/petitions')
                          ? 'text-light-blue after:bg-blue-500 after:absolute after:bottom-0 after:top-10 after:left-0 after:w-full after:h-1 after:bg-primary-blue after:animate-pulse-glow after:rounded-full after:transition-all after:duration-300'
                          : 'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all after:duration-300 hover:after:w-full'
                        }
              `}
                    >
                      Petitions
                    </Link>
                    <Link
                      href="/petitions/create"
                      className={`
                text-gray-300 hover:text-white relative transition-all duration-300
                ${isActive('/petitions/create')
                          ? 'text-light-blue after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-blue after:shadow-glow-blue after:rounded-full after:transition-all after:duration-300'
                          : 'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all after:duration-300 hover:after:w-full'
                        }
              `}
                    >
                      Create
                    </Link>
                  </nav>
                )}

                <ConnectButton.Custom>
                  {
                    ({
                      account,
                      chain,
                      openAccountModal,
                      openChainModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      // Note: If your app doesn't use authentication, you
                      // can remove all 'authenticationStatus' checks
                      const ready = mounted && authenticationStatus !== 'loading';
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                          authenticationStatus === 'authenticated');

                      return (
                        <div
                          {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                              opacity: 0,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <Button className="bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white" onClick={openConnectModal} type="button">
                                  Connect Wallet
                                </Button>
                              );
                            }

                            if (chain.unsupported) {
                              return (
                                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={openChainModal} type="button">
                                  Wrong network
                                </Button>
                              );
                            }

                            return (
                              <Button className="bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white" onClick={openAccountModal} type="button">
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    width={18}
                                    height={18}
                                  />
                                )}{account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ''}
                              </Button>
                            );
                          })()}
                        </div>
                      );
                    }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default AppHeader;