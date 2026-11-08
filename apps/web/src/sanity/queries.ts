import {defineQuery} from 'next-sanity'

export const POST_INDEX_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]
  | order(coalesce(publishedAt, _updatedAt) desc){
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "opening": pt::text(body[_type == "block" && style == "normal"][0...2])
}`)

export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current
}`)

export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  tags,
  coverImage{alt, hotspot, crop, asset->{_id, url, metadata{lqip, dimensions{width, height}}}},
  body[]{
    ...,
    _type == "image" => {alt, caption, hotspot, crop, asset->{_id, url, metadata{lqip, dimensions{width, height}}}}
  }
}`)

export const POST_METADATA_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  title,
  excerpt,
  publishedAt,
  "slug": slug.current,
  "opening": pt::text(body[_type == "block" && style == "normal"][0...2]),
  coverImage{alt, hotspot, crop, asset}
}`)
