import TileLayer from 'ol/layer/Tile';
import TileWmsSource from 'ol/source/TileWMS';
import OsmSource from 'ol/source/OSM';
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import MvtFormat from 'ol/format/MVT'
import GeoJsonFormat from 'ol/format/GeoJSON'
import TopoJsonFormat from 'ol/format/TopoJSON'
import KmlFormat from 'ol/format/KML'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XyzSource from 'ol/source/XYZ'
import { OlStyleFactory } from './OlStyle'

/**
 * Factory, which creates OpenLayers layer instances according to a given config
 * object.
 */
export const LayerFactory = {

  /**
   * Maps the format literal of the config to the corresponding OL module.
   * @type {Object}
   */
  formatMapping: {
    'MVT': MvtFormat,
    'GeoJSON': GeoJsonFormat,
    'TopoJSON': TopoJsonFormat,
    'KML': KmlFormat
  },

  /**
   * Create a random id string.
   *
   * @return {String} random string
   */
  randomId () {
    return Math.random().toString(36).substr(2, 5);
  },

  /**
   * Returns an OpenLayers layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.Base} OL layer instance
   */
  async getInstance (lConf) {
    // apply LID (Layer ID) if not existent
    if (!lConf.lid) {
      lConf.lid = this.randomId();
    }

    // create correct layer type
    if (lConf.type === 'WMS') {
      return this.createWmsLayer(lConf);
    } else if (lConf.type === 'XYZ') {
      return this.createXyzLayer(lConf);
    } else if (lConf.type === 'OSM') {
      return this.createOsmLayer(lConf);
    } else if (lConf.type === 'VECTOR') {
      return this.createVectorLayer(lConf);
    } else if (lConf.type === 'VECTORTILE') {
      return this.createVectorTileLayer(lConf);
    } else if (lConf.type === 'LAYERCOLLECTION') {
      return this.createLayersFromCollection(lConf);
    } else {
      return null;
    }
  },

  /**
   * Returns an OpenLayers WMS layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.Tile} OL WMS layer instance
   */
  createWmsLayer (lConf) {
    const layer = new TileLayer({
      name: lConf.name,
      lid: lConf.lid,
      displayInLayerList: lConf.displayInLayerList,
      selectable: lConf.selectable || false,
      extent: lConf.extent,
      visible: lConf.visible,
      opacity: lConf.opacity,
      source: new TileWmsSource({
        url: lConf.url,
        params: {
          'LAYERS': lConf.layers,
          'TILED': lConf.tiled
        },
        serverType: lConf.serverType,
        attributions: lConf.attributions
      })
    });

    return layer;
  },

  /**
   * Returns an XYZ based tile layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.Tile} OL XYZ layer instance
   */
  createXyzLayer (lConf) {
    const xyzLayer = new TileLayer({
      name: lConf.name,
      lid: lConf.lid,
      displayInLayerList: lConf.displayInLayerList,
      selectable: lConf.selectable || false,
      visible: lConf.visible,
      opacity: lConf.opacity,
      source: new XyzSource({
        url: lConf.url
      })
    });

    return xyzLayer;
  },

  /**
   * Returns an OpenLayers OSM layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.Tile} OL OSM layer instance
   */
  createOsmLayer (lConf) {
    const layer = new TileLayer({
      name: lConf.name,
      lid: lConf.lid,
      displayInLayerList: lConf.displayInLayerList,
      selectable: lConf.selectable || false,
      visible: lConf.visible,
      opacity: lConf.opacity,
      source: new OsmSource()
    });

    return layer;
  },

  /**
   * Returns an OpenLayers vector layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.Vector} OL vector layer instance
   */
  createVectorLayer (lConf) {
    const vectorLayer = new VectorLayer({
      name: lConf.name,
      lid: lConf.lid,
      displayInLayerList: lConf.displayInLayerList,
      selectable: lConf.selectable || false,
      extent: lConf.extent,
      visible: lConf.visible,
      opacity: lConf.opacity,
      source: new VectorSource({
        url: lConf.url,
        format: new this.formatMapping[lConf.format](lConf.formatConfig),
        attributions: lConf.attributions
      }),
      style: OlStyleFactory.getInstance(lConf.style),
      styleSelected: OlStyleFactory.getInstance(lConf.styleSelected),
      hoverable: lConf.hoverable,
      hoverAttribute: lConf.hoverAttribute
    });

    return vectorLayer;
  },

  /**
   * Returns an OpenLayers vector tile layer instance due to given config.
   *
   * @param  {Object} lConf  Layer config object
   * @return {ol.layer.VectorTile} OL vector tile layer instance
   */
  createVectorTileLayer (lConf) {
    const vtLayer = new VectorTileLayer({
      name: lConf.name,
      lid: lConf.lid,
      displayInLayerList: lConf.displayInLayerList,
      selectable: lConf.selectable || false,
      visible: lConf.visible,
      opacity: lConf.opacity,
      source: new VectorTileSource({
        url: lConf.url,
        format: new this.formatMapping[lConf.format](),
        attributions: lConf.attributions
      }),
      style: OlStyleFactory.getInstance(lConf.style),
      hoverable: lConf.hoverable,
      hoverAttribute: lConf.hoverAttribute
    });

    return vtLayer;
  },

  /**
   * Returns an array of Wegue Layer objects from given config.
   *
   * @param  {Object} lConf Wegue Layer list config object
   * @return {Array} array of layer instances
   */
  async createLayersFromCollection (lConf) {
    const response = await (await fetch(lConf.url)).json();
    return Promise.all(response.map(async layerDef => {
      // Always git it a random id
      layerDef.lid = layerDef.name;
      return this.getInstance(layerDef);
    }));
  }
}
