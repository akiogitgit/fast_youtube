import type { NextPage } from 'next'
import Link from 'next/link'
import React from 'react'

const YoutubeLayout: NextPage = () => {
  const videoIds = [
    ['uz8uQyFmxuo', '7vpj9UDylyM'],
    ['FKQyGoPzxe4', '0FnsXLmZZMk'],
    ['Zr3SNa6nyIg', 'yV7w3C6ZLkg'],
    ['1G6Ncqeo9js', 'VvFHyvQJNAs'],
    ['oupHYHv_me0', 'A2ti4_lNPL8'],
  ]
  const videoNum = 2

  return (
    <>
      <div>
        <Link href='/'>home</Link>
      </div>
      <div>
        {videoIds.map((v, i) => (
          <div className='flex mb-4 overflow-x-scroll' key={i}>
            {v.map((video, index) => (
              <div key={index}>
                <iframe
                  id='player'
                  width='300'
                  height='200'
                  src={'https://www.youtube.com/embed/' + video}
                  frameBorder='0'
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
export default YoutubeLayout
