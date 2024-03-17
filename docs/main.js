import { PGlite } from "@electric-sql/pglite";
import { createApp } from "petite-vue";

const db = new PGlite();
let debouncerTimer;

const PGLive = () => {
  return {
    result: "",
    queryInput: "",
    blocks: [],
    async executeQuery() {
      const qry = this.queryInput.trim();
      clearTimeout(debouncerTimer);
      debouncerTimer = setTimeout(async () => {
        console.log("Executing query", qry);
        if (qry.startsWith("http://") || qry.startsWith("https://")) {
          // Fetch from URL
          const response = await fetch(qry);
          const sql = await response.text();
          this.raw(sql);
        } else {
          this.raw(qry);
        }
      }, 500);
    },
    async executeFileQuery(file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const sql = e.target.result;
        this.raw(sql);
      };
      reader.readAsText(file);
    },
    async raw(sql) {
      const cleanedSql = sql
        .split("\n")
        .filter(
          (line) => !line.includes("\\! echo") && !line.startsWith("DROP")
        )
        .join("\n");
      try {
        const response = await db.query(cleanedSql);
        console.log("Response", response);
        this.result = JSON.stringify(response, null, 2);
      } catch (error) {
        console.log("Error", error);
        this.result = error.message;
      }
    },
    appendBlock() {
      this.blocks.push({
        query: this.queryInput,
        result: this.result,
      });
    },
  };
};

createApp({ PGLive }).mount();
