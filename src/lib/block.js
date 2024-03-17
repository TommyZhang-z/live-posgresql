import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

export class Block {
  async getQuery() {
    throw new Error("Method 'getQuery()' must be implemented.");
  }
}

export class RawSQLBlock extends Block {
  constructor(query) {
    super();
    this.query = query;
  }

  async getQuery() {
    return this.query;
  }
}

export class FileBlock extends Block {
  /**
   *
   * @param {File} file
   * @param {boolean} noDrop
   */
  constructor(file, noDrop = true) {
    super();
    this.file = file;
    this.noDrop = noDrop;
  }

  async getQuery() {
    const text = await this.file.text();
    const cleanedSql = sqlFile
      .split("\n")
      .filter(
        (line) =>
          !line.includes("\\! echo") && (!noDrop || !line.startsWith("DROP"))
      )
      .join("\n");
    return cleanedSql;
  }
}

export class UrlBlock extends Block {
  /**
   *
   * @param {URL} url
   */
  constructor(url) {
    super();
    this.url = url;
  }

  async getQuery() {
    const response = await fetch(this.url);
    return await response.text();
  }
}

export class Controller {
  /**
   *
   * @param {PGlite} db
   * @param {Block[]} blocks
   */
  constructor(db = new PGlite(), blocks = []) {
    this.db = db;
    this.blocks = blocks;
  }

  /**
   *
   * @param {Block} block
   * @returns
   */
  async execute(block) {
    const rawSql = await block.getQuery();
    return await this.db.query(rawSql);
  }
}
