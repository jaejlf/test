const express = require("express")
const router = express.Router()
const ctrl = require("./post.ctrl")
const pageCtrl = require("./page.ctrl")

router.post("/write", ctrl.createPost) // 게시글 작성
router.get("/posts", ctrl.getAllPost) // 전체 게시글 조회
router.put("/:postNumber", ctrl.editPost) // 게시글 수정
router.get("/:postNumber", ctrl.getPost) // 게시글 상세조회
router.delete("/:postNumber", ctrl.deletePost) // 게시글 삭제
router.get("/", pageCtrl.paging); //페이징

//추가기능
router.put("/:postNumber/good", ctrl.pushGood) //좋아요 누르기

module.exports = router
