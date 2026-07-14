/**
 * Coincide con las respuestas de CollectionController (/api/collections)
 * del API Contract v1.0.
 *
 * ⚠️ LIMITACIÓN DEL CONTRATO: GET /api/collections/me solo trae
 * { id, name, description, albumsCount } — NO el array real de
 * spotify_album_ids (aunque sí existe como columna en la tabla
 * COLLECTIONS), y no existe ningún GET /api/collections/{id} para ver
 * el detalle. Por eso el frontend no puede: mostrar carátulas reales
 * dentro de una lista, saber si un álbum específico ya está en tal
 * lista, ni ofrecer "quitar este álbum" desde una vista de detalle de
 * lista. Si se necesita eso, hay que pedirle a Kennet que agregue un
 * GET /api/collections/{id} que devuelva spotifyAlbumIds.
 */

export interface Collection {
  id: string;
  name: string;
  description?: string;
  albumsCount: number;
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
}

export interface AddAlbumResponse {
  id: string;
  albumsCount: number;
}

export interface RemoveAlbumResponse {
  albumsCount: number;
}