package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// 配置CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API 路由组
	api := r.Group("/api")
	{
		// 旅游景点API
		api.GET("/attractions", getAttractions)
		api.GET("/attractions/:id", getAttractionByID)

		// 用户API
		api.POST("/register", registerUser)
		api.POST("/login", loginUser)

		// 预订API
		auth := api.Group("/bookings").Use(authMiddleware())
		{
			auth.GET("", getBookings)
			auth.POST("", createBooking)
			auth.DELETE("/:id", cancelBooking)
		}
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	log.Println("Server starting on :8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// 模拟中间件：身份验证
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未授权"})
			c.Abort()
			return
		}
		// 这里应该进行 JWT 验证
		// 暂时简单实现，实际项目中应该使用 JWT 或其他认证方式
		c.Set("userID", "123") // 设置用户ID
		c.Next()
	}
}

// 模拟数据：景点列表
func getAttractions(c *gin.Context) {
	attractions := []gin.H{
		{
			"id":          "1",
			"name":        "长城",
			"description": "中国古代伟大的防御工程",
			"location":    "北京",
			"price":       120.0,
			"image":       "https://example.com/greatwall.jpg",
		},
		{
			"id":          "2",
			"name":        "故宫",
			"description": "中国明清两代的皇家宫殿",
			"location":    "北京",
			"price":       80.0,
			"image":       "https://example.com/forbiddencity.jpg",
		},
		{
			"id":          "3",
			"name":        "西湖",
			"description": "中国著名的风景名胜",
			"location":    "杭州",
			"price":       0.0,
			"image":       "https://example.com/westlake.jpg",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": attractions,
	})
}

// 获取特定景点详情
func getAttractionByID(c *gin.Context) {
	id := c.Param("id")
	// 实际应用中会从数据库查询
	attraction := gin.H{
		"id":          id,
		"name":        "长城",
		"description": "中国古代伟大的防御工程，是世界上最伟大的建筑之一。",
		"location":    "北京",
		"price":       120.0,
		"image":       "https://example.com/greatwall.jpg",
		"details":     "长城全长21196.18千米，是世界上最伟大的建筑之一。始建于2000多年前的秦朝，后经历代修缮扩建。",
	}

	c.JSON(http.StatusOK, gin.H{
		"data": attraction,
	})
}

// 用户注册
func registerUser(c *gin.Context) {
	var user struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println("error", err)
		return
	}

	// 实际应用中会存储到数据库，并进行密码加密
	c.JSON(http.StatusCreated, gin.H{
		"message": "用户注册成功",
		"user": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// 用户登录
func loginUser(c *gin.Context) {
	var login struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 实际应用中会从数据库验证，并生成 JWT token
	c.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"token":   "sample-jwt-token", // 实际应用中这里应返回 JWT
		"user": gin.H{
			"id":       "123",
			"username": login.Username,
			"role":     "user",
		},
	})
}

// 获取用户预订
func getBookings(c *gin.Context) {
	userID, _ := c.Get("userID")

	// 实际应用中会从数据库查询该用户的预订
	bookings := []gin.H{
		{
			"id":             "1",
			"attractionId":   "1",
			"attractionName": "长城",
			"date":           "2023-07-15",
			"quantity":       2,
			"totalPrice":     240.0,
			"status":         "confirmed",
		},
		{
			"id":             "2",
			"attractionId":   "2",
			"attractionName": "故宫",
			"date":           "2023-07-20",
			"quantity":       1,
			"totalPrice":     80.0,
			"status":         "pending",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": bookings,
		"user": userID,
	})
}

// 创建预订
func createBooking(c *gin.Context) {
	userID, _ := c.Get("userID")

	var booking struct {
		AttractionID string  `json:"attractionId" binding:"required"`
		Date         string  `json:"date" binding:"required"`
		Quantity     int     `json:"quantity" binding:"required,min=1"`
		Price        float64 `json:"price"`
	}

	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 实际应用中会将预订存储到数据库
	c.JSON(http.StatusCreated, gin.H{
		"message": "预订创建成功",
		"data": gin.H{
			"id":           "3",
			"userId":       userID,
			"attractionId": booking.AttractionID,
			"date":         booking.Date,
			"quantity":     booking.Quantity,
			"totalPrice":   booking.Price * float64(booking.Quantity),
			"status":       "confirmed",
			"createdAt":    time.Now().Format(time.RFC3339),
		},
	})
}

// 取消预订
func cancelBooking(c *gin.Context) {
	id := c.Param("id")

	// 实际应用中会从数据库中更新预订状态
	c.JSON(http.StatusOK, gin.H{
		"message": "预订已取消",
		"data": gin.H{
			"id":     id,
			"status": "cancelled",
		},
	})
}
